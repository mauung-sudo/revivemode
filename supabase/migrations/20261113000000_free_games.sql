-- Free, redistributable homebrew games hosted on the site.
--
-- Every hosted ROM records its license (rom_license, enforced by the
-- rom_needs_license check), who made it (publisher) and, for GPL games,
-- where the source code is (source_url). The game page shows all three.

alter table public.games add column if not exists source_url text;

-- GPL games must point to their source code.
alter table public.games drop constraint if exists gpl_needs_source;
alter table public.games add constraint gpl_needs_source
  check (rom_license is null or rom_license not ilike '%GPL%' or source_url is not null);

insert into public.games (id, title, platform, genre, year, players, cover_url, rom_url, rom_license, publisher, source_url)
values (
  'ucity', 'µCity', 'Game Boy', 'Simulation', 2017, 1,
  '/assets/covers/ucity.webp', '/games/ucity.gbc',
  'GPL-3.0-or-later; art and music CC BY-SA 4.0',
  'Antonio Niño Díaz (AntonioND)',
  'https://codeberg.org/SkyLyrac/ucity'
)
on conflict (id) do update set
  title = excluded.title, platform = excluded.platform, genre = excluded.genre, year = excluded.year,
  players = excluded.players, cover_url = excluded.cover_url, rom_url = excluded.rom_url,
  rom_license = excluded.rom_license, publisher = excluded.publisher, source_url = excluded.source_url;
