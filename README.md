# Waypoint Logistics · Database & Docker Environment

This folder contains the Docker Compose configuration and PostgreSQL database setup for the **Waypoint Group Logistics Platform** (Rootcode Tech-Triathlon 2026).

> **Documentation Suite in `../docs/`**:
> - 📊 [Entity-Relationship Diagram](../docs/waypoint_er_diagram.html)
> - 📋 [Database Schema & Data Dictionary](../docs/DATABASE_SCHEMA.md)
> - 🔍 [Database Views Specification](../docs/VIEWS.md)
> - 📝 [Input Forms & Mutation Specification](../docs/FORMS.md)
> - 📖 [Domain Vocabulary Glossary](../docs/CONTEXT.md)

---

## Quick Start

### 1. Start the Database
From this `waypoint/` directory, start the container:

```bash
docker compose up -d
```

Docker Compose will automatically:
1. Pull the official `postgres:16-alpine` image.
2. Create the volume `postgres_data`.
3. Execute `db/01-schema.sql` to initialize all custom ENUMs, tables, foreign keys, and indexes.
4. Execute `db/02-seed.sql` to populate the initial master data, seeded user accounts, fleet vehicles, outlets, and a realistic delivery scenario.

### 2. Check Database Status & Health
```bash
docker compose ps
```

### 3. Connect to PostgreSQL via CLI
```bash
docker compose exec postgres psql -U waypoint_user -d waypoint_db
```

### 4. Stop the Database
```bash
docker compose down
```
To stop and reset all data volumes:
```bash
docker compose down -v
```

---

## Database Credentials

| Parameter | Value |
| :--- | :--- |
| **Host** | `localhost` (or `postgres` inside Docker network) |
| **Port** | `5432` |
| **Database** | `waypoint_db` |
| **Username** | `waypoint_user` |
| **Password** | `waypoint_secure_pass` |
| **Connection URL** | `postgresql://waypoint_user:waypoint_secure_pass@localhost:5432/waypoint_db` |

---

## Seeded User Accounts (Judging Walkthrough)

As specified in the competition Hackathon brief, four user accounts have been seeded:

| Role | Username | Password | Full Name | Assignment |
| :--- | :--- | :--- | :--- | :--- |
| **Dispatcher** | `dispatcher` | `dispatch123` | Sarath Gunawardena | Peliyagoda Planning Office |
| **Loader** | `loader` | `loader123` | Sunil Jayasinghe | Peliyagoda Loading Dock |
| **Driver** | `driver` | `driver123` | Nimal Fernando | Vehicle `VEH001` (Peliyagoda) |
| **Store Manager** | `store_manager` | `store123` | Anura Silva | Waypoint Fresh `OUT001` (Colombo) |

---

---

## Web Application (Next.js 16 + Tailwind CSS + shadcn/ui)

The frontend is bootstrapped with **Next.js 16 (Turbopack)**, **Tailwind CSS v4**, and **shadcn/ui** components.

### 1. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 2. Build for Production
```bash
npm run build
npm run start
```

### 3. Adding More shadcn Components
```bash
npx shadcn@latest add <component-name>
```
Pre-installed UI components in `src/components/ui/`:
- `button`
- `card`
- `input`
- `badge`
- `tabs`
- `table`
- `dialog`
- `separator`

---

## Directory Structure

```
waypoint/
├── docker-compose.yml       # PostgreSQL 16 container definition with healthchecks
├── .env.example             # Template environment variables
├── .env                     # Local environment settings
├── components.json          # shadcn/ui configuration
├── next.config.ts           # Next.js configuration
├── tsconfig.json            # TypeScript configuration
├── package.json             # NPM dependencies & scripts
├── README.md                # Setup instructions and seeded credentials
├── db/
│   ├── 01-schema.sql        # Full DDL schema (25 tables, enums, FKs, indexes)
│   ├── 02-seed.sql          # Seed data (Depots, Brands, Outlets, Fleet, Orders)
│   └── 03-views.sql         # 19 Role-based and feasibility validator views
└── src/
    ├── app/
    │   ├── layout.tsx       # Root layout with dark mode & typography
    │   ├── page.tsx         # Interactive role launcher & overview
    │   └── globals.css      # Tailwind CSS v4 & theme variables
    ├── components/
    │   └── ui/              # shadcn components (button, card, tabs, badge, etc.)
    └── lib/
        └── utils.ts         # cn() utility helper for Tailwind classes
```
