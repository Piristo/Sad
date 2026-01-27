# Deploy (Vercel + MongoDB Atlas)

This project is deployed as a Vercel SPA with Vercel Functions under `Frontend/api`.

## 1) MongoDB Atlas (free M0)
1. Create an M0 cluster.
2. Create a database user.
3. Add Network Access `0.0.0.0/0` (for quick start).
4. Copy the connection string:
   `mongodb+srv://USER:PASSWORD@cluster.mongodb.net/DBNAME?retryWrites=true&w=majority`

## 2) GitHub
1. Create a new repo.
2. Push this project to GitHub.

## 3) Vercel
1. Import the GitHub repo in Vercel.
2. Set **Root Directory** to `Frontend`.
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Environment Variables:
   - `DATABASE_URL` = Atlas connection string
   - `VITE_API_URL` = `/api`

## 4) Verify
Open `https://<your-project>.vercel.app/api` and verify it returns JSON.

## 5) Telegram
Update the WebApp domain in BotFather `/setdomain` to the Vercel domain.
