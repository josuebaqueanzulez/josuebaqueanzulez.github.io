-- Logística Solidaria Ecuador: ejecutar en SQL Editor del proyecto Supabase
-- No almacene teléfonos, documentos de identidad ni direcciones particulares en los reportes.
create extension if not exists pgcrypto;
create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 role text not null default 'reporter' check(role in ('reporter','coordinator')),
 created_at timestamptz not null default now()
);
create table if not exists public.community_reports (
 id uuid primary key default gen_random_uuid(),
 created_by uuid not null references auth.users(id) on delete cascade,
 canton text not null check(length(trim(canton)) between 2 and 80),
 need text not null check(need in ('Agua potable','Alimentos','Higiene','Salud','Alojamiento','Otros')),
 families integer not null check(families between 1 and 10000),
 details text not null default '' check(length(details)<=500),
 status text not null default 'pending' check(status in ('pending','verified','rejected')),
 reviewed_by uuid references auth.users(id),
 reviewed_at timestamptz,
 created_at timestamptz not null default now()
);
create index if not exists reports_status_created on public.community_reports(status,created_at desc);
create index if not exists reports_creator on public.community_reports(created_by);
alter table public.profiles enable row level security;
alter table public.community_reports enable row level security;
revoke all on public.profiles from anon;
revoke all on public.community_reports from anon;
grant select on public.profiles to authenticated;
grant select,insert on public.community_reports to authenticated;
create or replace function public.my_role() returns text language sql stable security definer set search_path=public as $$
 select coalesce((select role from public.profiles where id=auth.uid()),'reporter');
$$;
revoke all on function public.my_role() from public;
grant execute on function public.my_role() to authenticated;
drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select to authenticated using(id=auth.uid() or public.my_role()='coordinator');
drop policy if exists reports_select on public.community_reports;
create policy reports_select on public.community_reports for select to authenticated
 using(created_by=auth.uid() or status='verified' or public.my_role()='coordinator');
drop policy if exists reports_insert on public.community_reports;
create policy reports_insert on public.community_reports for insert to authenticated
 with check(created_by=auth.uid() and status='pending' and reviewed_by is null and reviewed_at is null);
-- No UPDATE / DELETE directo: únicamente revisión desde una función con rol comprobado
create or replace function public.review_report(p_id uuid,p_status text)
returns void language plpgsql security definer set search_path=public as $$
begin
 if auth.uid() is null or public.my_role()<>'coordinator' then
  raise exception 'No autorizado';
 end if;
 if p_status not in ('verified','rejected') then raise exception 'Estado inválido'; end if;
 update public.community_reports
 set status=p_status, reviewed_by=auth.uid(), reviewed_at=now()
 where id=p_id and status='pending';
 if not found then raise exception 'Reporte inexistente o revisado'; end if;
end $$;
revoke all on function public.review_report(uuid,text) from public;
grant execute on function public.review_report(uuid,text) to authenticated;
-- Alta segura de perfil sin permitir que nuevos usuarios se asignen coordinador
create or replace function public.new_profile() returns trigger
language plpgsql security definer set search_path=public as $$
begin insert into public.profiles(id,role) values(new.id,'reporter') on conflict(id) do nothing;return new;end $$;
drop trigger if exists on_auth_user_created_lse on auth.users;
create trigger on_auth_user_created_lse after insert on auth.users for each row execute procedure public.new_profile();
insert into public.profiles(id,role) select id,'reporter' from auth.users on conflict(id) do nothing;
-- Nombramiento de coordinador: ejecutar MANUALMENTE por dueño en SQL Editor,
-- tras verificar identidad y autorización de la persona:
-- update public.profiles set role='coordinator' where id='UUID_VERIFICADO';
