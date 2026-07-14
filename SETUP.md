# RedDrop — Setup Guide

## 1. Folder layout

```
RedDrop/
├── backend/
│   ├── .env.example      # copy → .env
│   └── .gitignore
└── frontend/             # React app (Vite + Redux Toolkit + Tailwind)
    ├── .env.example      # copy → .env
    ├── .gitignore
    ├── src/
    └── ...
```

## 2. Environment variables

### Backend (`backend/.env`)
Copy `backend/.env.example` → `backend/.env` and fill in:

| Variable | Purpose |
|---|---|
| `MONGO_URI` | MongoDB connection string (local or Atlas) |
| `JWT_SECRET` | Long random string used to sign auth tokens |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `PORT` | Port the Express server listens on (default `5000`) |
| `CLIENT_URL` | Frontend origin, for CORS (`http://localhost:5173` in dev; `https://reddrop-lucw-three.vercel.app` on Render) |
| `BCRYPT_SALT_ROUNDS` | Password hashing cost factor |
| `SMTP_*` / `CLOUDINARY_*` | Optional — only needed if you wire up email or image uploads |

Generate a strong JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Frontend (`frontend/.env`)
Copy `frontend/.env.example` → `frontend/.env`:

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Base URL of your backend API, e.g. `http://localhost:5000/api` |
| `VITE_APP_NAME` | Display name used in the UI |
| `VITE_APP_ENV` | `development` / `production` (toggles Redux DevTools) |

⚠️ Only variables prefixed `VITE_` are exposed to the browser bundle — never put secrets in the frontend `.env`.

## 3. Running the frontend

```bash
cd frontend
npm install
cp .env.example .env      # then edit VITE_API_BASE_URL if needed
npm run dev                # http://localhost:5173
```

Build for production:
```bash
npm run build
npm run preview
```

## 4. Running the backend

The backend directory currently contains only `.env.example` and `.gitignore` — plug in your Express/Mongoose code (models, controllers, routes) per the architecture in the original spec, then:

```bash
cd backend
npm install
cp .env.example .env      # then fill in MONGO_URI and JWT_SECRET
npm run dev                # http://localhost:5000
```

## 5. What talks to what

- `src/api/axiosInstance.js` reads `VITE_API_BASE_URL` and attaches the JWT (`reddrop_token` in `localStorage`) to every request via an `Authorization: Bearer <token>` header.
- A `401` response anywhere triggers an automatic logout + redirect to `/login`.
- Redux slices (`authSlice`, `bloodRequestSlice`, `donorSlice`) call this instance — point `VITE_API_BASE_URL` at your running backend and the app works end-to-end.

## 6. Deploying to Vercel

Deploy the backend on Render before deploying the frontend. The browser must be given the public Render API URL during the Vercel build; localhost URLs only work on your computer.

### Render (API)

Create a **Web Service** from this repository. The included `render.yaml` supplies the commands, or enter these values manually:

| Setting | Value |
| --- | --- |
| Root directory | `backend` |
| Build command | `npm ci` |
| Start command | `npm start` |
| Health check path | `/` |

Set these Render environment variables (do not include quotes):

| Variable | Production value |
| --- | --- |
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A long, random secret |
| `JWT_EXPIRES_IN` | `7d` |
| `CLIENT_URL` | Your exact Vercel URL, e.g. `https://your-app.vercel.app` |

Open `https://<your-render-service>.onrender.com/` after deployment. It must return the API health-check JSON before continuing.

### Vercel (frontend)

Import this repository with its root directory set to `RedDrop/` (the repository root). `vercel.json` runs the Vite build from `frontend/` and serves React routes correctly.

In **Settings → Environment Variables**, add this for **Production** and redeploy:

| Variable | Value |
| --- | --- |
| `VITE_API_URL` | `https://reddrop-yr8u.onrender.com/api` |

`VITE_API_URL` is compiled into the Vite bundle, so changing it requires a new Vercel deployment. Do not use `localhost`, and include the `/api` suffix.

If the API reports a CORS error, compare `CLIENT_URL` with the browser address exactly—protocol and any custom domain must match. Multiple allowed frontend URLs can be provided as a comma-separated `CLIENT_URL` or `FRONTEND_URL` value.

## 7. Git hygiene

Both `.gitignore` files already exclude `node_modules/`, all `.env*` files, build output (`dist/`), and editor/OS junk — so real secrets never get committed. Only `.env.example` (with placeholder values) should ever be pushed to version control.
