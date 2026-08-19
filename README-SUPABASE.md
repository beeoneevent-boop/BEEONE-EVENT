# BeeOne Event — Supabase + GitHub Pages

This version removes the Node/SQLite backend and uses Supabase directly from the browser,
so it can be hosted as a static GitHub Pages site.

## 1. Create the Supabase database

1. Create a Supabase project.
2. Open **SQL Editor**.
3. Open `supabase-schema.sql` from this project.
4. Paste the whole file and click **Run**.

The existing SQLite content is already included in the SQL.

## 2. Add the Supabase keys

Open:

`js/supabase-config.js`

Set:

- `SUPABASE_URL` = your Supabase Project URL
- `SUPABASE_ANON_KEY` = your Supabase Publishable/Anon key

Use the browser-safe Publishable/Anon key only. Never put a `service_role` or secret key in GitHub.

## 3. Push to GitHub

Upload the project files to your GitHub repository and enable:

**Settings → Pages → Deploy from branch → main → / (root)**

The site is now static and reads/writes event data through Supabase.

## Important security note

The original project stores the admin username/password and admin session in browser JavaScript/localStorage.
The supplied Supabase policies therefore allow public CRUD access so the existing app keeps working.

Before using this for a real event, move admin login to **Supabase Auth** and change the RLS policies
so only authenticated/admin users can write event data.

## Speakers
The default speaker records have been removed. `eventalk_speakers` is seeded as an empty array. If the old records are already in your Supabase project, running `supabase-schema.sql` clears them.
