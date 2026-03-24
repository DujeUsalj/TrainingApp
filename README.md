# Training Monitor

Web aplikacija za planiranje, praćenje i analizu procesa treniranja (React + Vite, Node.js + Express, PostgreSQL, JWT).

## Struktura

- `client/` — React frontend  
- `server/` — Express API  

## Lokalno pokretanje

### Baza

Kreiraj PostgreSQL bazu i tablice (prema tvom postojećem SQL-u).

### Backend

```bash
cd server
cp .env.example .env
# uredi .env (PORT, DB_*, JWT_SECRET)
npm install
npm run dev
```

### Frontend

```bash
cd client
cp .env.example .env.development
# postavi VITE_API_BASE_URL na http://127.0.0.1:5001 (ili LAN IP za mobitel)
npm install
npm run dev
```

## Produkcija

Detaljne korake vidi u **[docs/DEPLOY.md](docs/DEPLOY.md)** — **Railway + Vercel** (ako Render ne radi) ili Render + Vercel.

## Korisne naredbe

- Promjena uloge korisnika (lokalno): `cd server && npm run set-role -- email@x.com COACH`
