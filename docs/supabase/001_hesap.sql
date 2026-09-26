-- EyeTrail hesap tabloları (Build 23b). Supabase → SQL Editor → New query → bu dosyanın tamamını yapıştır → Run.
-- Tekrar çalıştırmak güvenlidir (IF NOT EXISTS / OR REPLACE).
-- Kural: her kişi YALNIZ kendi satırını görür ve değiştirir (RLS). Gizli anahtar (secret / service_role) uygulamada YOK.

-- 1) Profil: uygulamadaki "Seni tanıyalım" formu. Fotoğraf burada TUTULMAZ (yalnız telefonda).
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text check (char_length(name) <= 40),
  birth_date date check (birth_date > date '1900-01-01'),
  city text check (char_length(city) <= 60),
  correction text check (correction in ('none', 'distance', 'reading', 'progressive', 'contacts-multi')),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profil: kendi satırını okur" on public.profiles;
create policy "profil: kendi satırını okur" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);

drop policy if exists "profil: kendi satırını ekler" on public.profiles;
create policy "profil: kendi satırını ekler" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);

drop policy if exists "profil: kendi satırını günceller" on public.profiles;
create policy "profil: kendi satırını günceller" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- "Automatically expose new tables" kapalı olduğu için erişim burada açıkça verilir (yalnız giriş yapmış kişiye).
revoke all on public.profiles from anon;
-- Proje varsayılanı giriş yapmış role DELETE/TRUNCATE da veriyordu (2026-09-26 kontrol); uygulamanın ihtiyacı yok.
revoke delete, truncate, references, trigger on public.profiles from authenticated;
grant select, insert, update on public.profiles to authenticated;

-- 2) Hesabımı sil (App Store 5.1.1(v)): kişi yalnız KENDİ hesabını siler; profil satırı cascade ile gider.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'giriş yapılmamış';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
