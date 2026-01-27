# Deploy (Cloudflare Pages + Supabase)

This project is deployed as a Cloudflare Pages SPA with Pages Functions under `Frontend/functions`.

## 1) Supabase (free)
1. Create a project.
2. Create a table `users`:
   - `id` bigint, identity, primary key
   - `tlgid` bigint, unique, not null
   - `name` text, nullable
3. Get:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only)

## 2) GitHub
1. Create a repo.
2. Push this project to GitHub.

## 3) Cloudflare Pages
1. Create a Pages project and connect the GitHub repo.
2. Set **Root Directory** to `Frontend`.
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Environment Variables (Pages > Settings > Environment variables):
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `VITE_API_URL` = `/api`

## 4) Verify
Open `https://<your-project>.pages.dev/api` and verify it returns JSON.

## 5) Telegram
Update the WebApp domain in BotFather `/setdomain` to the Pages domain.
