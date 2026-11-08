# Mix

SaaS për kompani rent-a-car: treg publik + panel për flotën, rezervimet dhe billing.

## Apps
- `apps/api` — FastAPI
- `apps/mix-frontend` — Next.js (frontend kryesor)
- `apps/mix-app` — Vite (alternativa SPA)

## Nisja lokale

1. Postgres + API:

```bash
cp env.example .env
cd apps/api
python -m pip install -e .
# krijo .env me DATABASE_URL dhe SECRET_KEY
python -m app.main
python scripts/seed.py
```

Demo: `demo@mix.al` / `demo123`

2. Frontend:

```bash
cd apps/mix-frontend
npm install
npm run dev
```

Hape `http://localhost:3000`. API duhet në `http://127.0.0.1:8000`.

Ose SPA: `cd apps/mix-app && npm install && npm run dev` (zakonisht `:5173`).

## Docker

```bash
cp env.example .env
docker compose up --build
```

Caddy në portin 80.

## Seed
`python apps/api/scripts/seed.py` — kompani demo, 3 makina, plan Starter.
