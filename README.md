# VideoFlow

A full-stack video catalog app built to learn PostgreSQL. Features a public streaming page and an admin analytics dashboard backed by a live PostgreSQL database.

![Home](public/screenshot-home.png)

![Admin](public/screenshot-admin.png)

## Stack

- **Next.js 16** — App Router, Route Handlers
- **PostgreSQL** — via Docker
- **postgres.js** — SQL tagged template literals, connection pooling, transactions
- **Chart.js** — analytics charts
- **Tailwind CSS**

## Features

- Video catalog with player — click any card to play
- Play tracking — every play is recorded to the database
- Admin dashboard — top videos by play count, daily plays over 30 days
- All data live from PostgreSQL — no mocks

## SQL patterns used

- `SELECT` with `ORDER BY`
- `INSERT` + `UPDATE` wrapped in a transaction
- `LEFT JOIN` + `GROUP BY` + `COUNT` for aggregations
- `date_trunc` + `INTERVAL` for time-series analytics

## Setup

**Prerequisites:** Node.js, Docker

```bash
# 1. Clone and install
git clone https://github.com/balbonits/postgresql-demo.git
cd postgresql-demo
npm install

# 2. Start PostgreSQL
docker run --name video-catalog-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=video_catalog \
  -p 5432:5432 -d postgres

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local — set DATABASE_URL=postgresql://postgres:postgres@localhost:5432/video_catalog

# 4. Start the app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public page, [http://localhost:3000/admin](http://localhost:3000/admin) for the admin dashboard.
