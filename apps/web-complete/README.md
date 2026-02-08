# Mix Web (Next.js)

Frontend për platformën Mix (Rent-a-Car SaaS).

## Setup

1) Krijo `.env.local`:
```bash
cp .env.local.example .env.local
```

2) Install:
```bash
npm i
```

3) Dev:
```bash
npm run dev
```

## Si lidhet me backend-in

- UI pages: `/auth/*`, `/dashboard/*`, `/companies/*`
- Proxy routes: `/api/*` (Next Route Handlers) → forward te FastAPI (`API_URL`)

Kjo i shmang problemet e CORS dhe ruan cookies.
