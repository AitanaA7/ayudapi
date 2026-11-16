-- Normaliza incidentes abiertos y actualiza RPCs para que las alertas nazcan en curso.
-- Idempotente: seguro re-ejecutar.

update public.incidentes
set estado = 'en_curso'
where estado = 'enviado';

create or replace function public.activar_alerta_emergencia(
  p_slug text,
  p_lat double precision default null,
  p_lng double precision default null,
  p_exacta boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_paciente_id uuid;
  v_incidente_id uuid;
  v_contactos jsonb;
  v_contacto record;
  v_contador int := 0;
begin
  select p.id, p.contactos_emergencia
  into v_paciente_id, v_contactos
  from public.perfiles_paciente p
  join public.tokens_qr t on t.paciente_id = p.id
  where t.slug = p_slug and t.activo = true and p.qr_activo = true
  limit 1;

  if v_paciente_id is null then
    raise exception 'QR no activo o no encontrado';
  end if;

  insert into public.incidentes (paciente_id, tipo, estado, lat, lng, ubicacion)
  values (
    v_paciente_id,
    'emergencia_qr',
    'en_curso',
    p_lat,
    p_lng,
    case when p_exacta and p_lat is not null and p_lng is not null 
      then ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)
      else null
    end
  )
  returning id into v_incidente_id;

  if jsonb_array_length(v_contactos) > 0 then
    for v_contacto in select * from jsonb_to_recordset(v_contactos) as x(nombre text, relacion text, telefono text)
    loop
      insert into public.notificaciones (incidente_id, contacto, canal, estado)
      values (v_incidente_id, row_to_json(v_contacto)::jsonb, 'sms', 'enviado');
      v_contador := v_contador + 1;
    end loop;
  end if;

  return json_build_object('incidente_id', v_incidente_id, 'notificaciones', v_contador);
end;
$$;

grant execute on function public.activar_alerta_emergencia(text, double precision, double precision, boolean) to service_role, anon;

create or replace function public.dashboard_metricas(p_periodo text default '12m')
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_desde timestamptz;
begin
  v_desde := case
    when p_periodo = '1m' then now() - interval '1 month'
    when p_periodo = '6m' then now() - interval '6 months'
    else now() - interval '12 months'
  end;

  return jsonb_build_object(
    'periodo', p_periodo,
    'desde', v_desde,
    'resumen', jsonb_build_object(
      'incidentes', (select count(*)::int from public.incidentes i where i.timestamp >= v_desde),
      'resueltos',  (select count(*)::int from public.incidentes i where i.timestamp >= v_desde and i.estado = 'resuelto'),
      'en_curso',   (select count(*)::int from public.incidentes i where i.timestamp >= v_desde and i.estado in ('en_curso', 'enviado')),
      'escaneos',   (select count(*)::int from public.escaneos_qr e where e.creado_en >= v_desde),
      'atenciones', (select count(*)::int from public.atenciones a where a.fecha_atencion >= v_desde),
      'registros_medicos', (select count(*)::int from public.registros_medicos r where r.creado_en >= v_desde)
    ),
    'por_estado', coalesce((
      select jsonb_agg(jsonb_build_object('estado', fe.estado, 'cantidad', fe.cantidad) order by fe.cantidad desc)
      from (
        select i.estado::text as estado, count(*)::int as cantidad
        from public.incidentes i
        where i.timestamp >= v_desde
        group by i.estado
      ) fe
    ), '[]'::jsonb),
    'por_zona', coalesce((
      select jsonb_agg(zz.obj order by (zz.obj->>'incidentes')::int desc, (zz.obj->>'atenciones')::int desc)
      from (
        select jsonb_build_object(
          'zona', z.zona,
          'lat', z.lat,
          'lng', z.lng,
          'incidentes', (select count(*)::int
            from public.incidentes i
            where i.timestamp >= v_desde
              and public.zona_id(public.punto_lng(i.ubicacion, i.lng), public.punto_lat(i.ubicacion, i.lat)) = z.zona),
          'escaneos', (select count(*)::int
            from public.escaneos_qr e
            where e.creado_en >= v_desde
              and public.zona_id(e.lng, e.lat) = z.zona),
          'atenciones', (select count(*)::int
            from public.atenciones a
            join public.incidentes i on i.id = a.incidente_id
            where a.fecha_atencion >= v_desde
              and public.zona_id(public.punto_lng(i.ubicacion, i.lng), public.punto_lat(i.ubicacion, i.lat)) = z.zona)
        ) as obj
        from (
          select u.zona as zona, u.lat as lat, u.lng as lng
          from (
            select public.zona_id(public.punto_lng(i.ubicacion, i.lng), public.punto_lat(i.ubicacion, i.lat)) as zona,
                   public.zona_centro_lat(public.punto_lat(i.ubicacion, i.lat)) as lat,
                   public.zona_centro_lng(public.punto_lng(i.ubicacion, i.lng)) as lng
            from public.incidentes i
            where i.timestamp >= v_desde
              and (i.ubicacion is not null or (i.lat is not null and i.lng is not null))
            union
            select public.zona_id(e.lng, e.lat) as zona,
                   public.zona_centro_lat(e.lat) as lat,
                   public.zona_centro_lng(e.lng) as lng
            from public.escaneos_qr e
            where e.creado_en >= v_desde
              and e.lat is not null and e.lng is not null
          ) u
        ) z
      ) zz
    ), '[]'::jsonb),
    'por_patologia', coalesce((
      select jsonb_agg(pp.obj order by (pp.obj->>'incidentes')::int desc, (pp.obj->>'atenciones')::int desc)
      from (
        select jsonb_build_object(
          'patologia', pj.tipo,
          'incidentes', (select count(distinct i.id)::int
            from public.incidentes i
            join public.perfiles_paciente per on per.id = i.paciente_id
            cross join lateral jsonb_array_elements(public.patologias_array(per.patologias)) as ej
            where i.timestamp >= v_desde and ej->>'tipo' = pj.tipo),
          'atenciones', (select count(distinct a.id)::int
            from public.atenciones a
            join public.perfiles_paciente per on per.id = a.paciente_id
            cross join lateral jsonb_array_elements(public.patologias_array(per.patologias)) as ej
            where a.fecha_atencion >= v_desde and ej->>'tipo' = pj.tipo)
        ) as obj
        from (
          select distinct ej2->>'tipo' as tipo
          from public.perfiles_paciente per2
          cross join lateral jsonb_array_elements(public.patologias_array(per2.patologias)) as ej2
          where ej2->>'tipo' is not null
        ) pj
      ) pp
    ), '[]'::jsonb)
  );
end;
$$;

grant execute on function public.dashboard_metricas(text) to service_role;
