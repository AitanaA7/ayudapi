-- Asegura que el enum de estado de incidentes permita los estados usados por el flujo actual.
-- Idempotente: seguro re-ejecutar.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'estado_incidente_t') then
    create type estado_incidente_t as enum ('enviado', 'en_curso', 'resuelto', 'cancelado');
  end if;
end
$$;

alter type public.estado_incidente_t add value if not exists 'enviado';
alter type public.estado_incidente_t add value if not exists 'en_curso';
alter type public.estado_incidente_t add value if not exists 'resuelto';
