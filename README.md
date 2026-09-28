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

## Directory Structure

```
waypoint/
├── docker-compose.yml       # PostgreSQL 16 container definition with healthchecks
├── .env.example             # Template environment variables
├── .env                     # Local environment settings
├── README.md                # Setup instructions and seeded credentials
└── db/
    ├── 01-schema.sql        # Full DDL schema (25 tables, enums, FKs, indexes)
    ├── 02-seed.sql          # Seed data (Depots, Brands, Outlets, Fleet, Orders)
    └── 03-views.sql         # 19 Role-based and feasibility validator views
```
