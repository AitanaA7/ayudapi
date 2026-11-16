-- =============================================================================
-- Métricas reales: resolución de incidentes y origen de escaneos QR
-- Idempotente: seguro re-ejecutar.
-- =============================================================================

-- Cierre del ciclo de vida del incidente.
alter table public.incidentes
  add column if not exists resuelto_en timestamptz;

-- Origen del escaneo: los registros históricos quedan como 'medico'.
alter table public.escaneos_qr
  add column if not exists origen text not null default 'medico';

alter table public.escaneos_qr
  add column if not exists ip_hash text;

do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'escaneos_qr_origen_check'
  ) then
    alter table public.escaneos_qr
      add constraint escaneos_qr_origen_check
      check (origen in ('publico', 'medico'));
  end if;
end $$;

create index if not exists idx_escaneos_qr_origen_creado
  on public.escaneos_qr (origen, creado_en desc);

create index if not exists idx_escaneos_qr_dedupe
  on public.escaneos_qr (token_qr_id, origen, ip_hash, creado_en desc);

create index if not exists idx_incidentes_paciente_estado
  on public.incidentes (paciente_id, estado, timestamp desc);

create index if not exists idx_incidentes_estado_timestamp
  on public.incidentes (estado, timestamp desc);

-- Registro de escaneo público con deduplicación de 60 segundos por
-- token + hash de IP. SECURITY DEFINER para que el visitante anónimo no
-- necesite permisos de INSERT sobre `escaneos_qr`.
create or replace function public.registrar_escaneo_publico(
  p_slug text,
  p_ip_hash text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_token public.tokens_qr%rowtype;
  v_paciente public.perfiles_paciente%rowtype;
  v_escaneo_id uuid;
begin
  if p_slug is null or length(trim(p_slug)) = 0 then
    return jsonb_build_object('registrado', false, 'motivo', 'slug_invalido');
  end if;

  select *
  into v_token
  from public.tokens_qr
  where slug = trim(p_slug)
  limit 1;

  if not found then
    return jsonb_build_object('registrado', false, 'motivo', 'qr_no_encontrado');
  end if;

  if not v_token.activo then
    return jsonb_build_object('registrado', false, 'motivo', 'qr_inactivo');
  end if;

  select *
  into v_paciente
  from public.perfiles_paciente
  where id = v_token.paciente_id
  limit 1;

  if not found or not v_paciente.qr_activo then
    return jsonb_build_object('registrado', false, 'motivo', 'qr_inactivo');
  end if;

  if exists (
    select 1
    from public.escaneos_qr e
    where e.token_qr_id = v_token.id
      and e.origen = 'publico'
      and e.ip_hash is not distinct from p_ip_hash
      and e.creado_en >= now() - interval '60 seconds'
  ) then
    return jsonb_build_object('registrado', false, 'motivo', 'duplicado');
  end if;

  insert into public.escaneos_qr (
    token_qr_id,
    paciente_id,
    usuario_id,
    rol_en_momento,
    origen,
    ip_hash
  )
  values (
    v_token.id,
    v_paciente.id,
    null,
    'interviniente',
    'publico',
    p_ip_hash
  )
  returning id into v_escaneo_id;

  return jsonb_build_object('registrado', true, 'escaneo_id', v_escaneo_id);
end;
$$;

grant execute on function public.registrar_escaneo_publico(text, text) to anon, authenticated;
