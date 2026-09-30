# Waypoint Database Migrations & Docker Volume Lifecycle

This document explains how PostgreSQL database initialization works with Docker Compose and how to apply new schema changes or migrations without running into stale volume issues.

---

## ⚠️ Important Docker PostgreSQL Volume Behavior

### Why `docker compose up` Might Not Apply New Migrations
Official PostgreSQL Docker images only execute scripts placed inside `/docker-entrypoint-initdb.d/` **when the container initializes an empty database directory for the first time**.

In `docker-compose.yml`, data is persisted in a named volume:
```yaml
volumes:
  - postgres_data:/var/lib/postgresql/data
  - ./db/01-schema.sql:/docker-entrypoint-initdb.d/01-schema.sql:ro
  - ./db/02-seed.sql:/docker-entrypoint-initdb.d/02-seed.sql:ro
  - ./db/03-views.sql:/docker-entrypoint-initdb.d/03-views.sql:ro
  - ./db/04-better-auth.sql:/docker-entrypoint-initdb.d/04-better-auth.sql:ro
  - ./db/05-auth-seed.sql:/docker-entrypoint-initdb.d/05-auth-seed.sql:ro
```

**If you have previously run `docker compose up`**:
1. The volume `postgres_data` already exists on your machine.
2. PostgreSQL detects existing database files in `/var/lib/postgresql/data`.
3. PostgreSQL **skips `initdb` and skips `/docker-entrypoint-initdb.d/` entirely**.
4. Any newly added scripts (such as `04-better-auth.sql` or `05-auth-seed.sql`) will **not** be executed automatically.

---

## How to Apply Migrations

### Method 1: Fresh Reset (Recommended for Development)
To completely reset the database and run all initialization scripts from scratch in alphabetical order (`01` through `05`):

```bash
# 1. Stop containers and destroy the persistent volume (-v flag)
docker compose down -v

# 2. Start PostgreSQL fresh with all migrations applied
docker compose up -d
```

---

### Method 2: Apply Migrations to a Running Database (Preserve Data)
If you already have existing data you do not want to delete, apply the newer migration files directly using `psql`:

```bash
# Apply Better Auth schema
docker compose exec -T postgres psql -U waypoint_user -d waypoint_db < db/04-better-auth.sql

# Apply Better Auth operational seed accounts
docker compose exec -T postgres psql -U waypoint_user -d waypoint_db < db/05-auth-seed.sql
```

---

## Migration Sequence

Scripts are executed in alphabetical order by PostgreSQL's entrypoint:

| File | Purpose |
| :--- | :--- |
| `01-schema.sql` | Core domain DDL: 25 relational tables, ENUM types, constraints, and indexes. |
| `02-seed.sql` | Master reference data: Depots, brands, outlets, vehicles, and initial mock delivery orders. |
| `03-views.sql` | Operational SQL views: Role dashboards, load lists, control tower, and feasibility checks. |
| `04-better-auth.sql` | Better Auth internal tables: `"user"`, `"session"`, `"account"`, and `"verification"`. |
| `05-auth-seed.sql` | Credentials seed: Provisions the 4 operational staff accounts with Better Auth scrypt password hashes. |

---

## Verifying Migrations

To verify that all migrations are active:

```bash
# Check that all tables exist
docker compose exec -T postgres psql -U waypoint_user -d waypoint_db -c "\dt"

# Check that Better Auth seed accounts are loaded
docker compose exec -T postgres psql -U waypoint_user -d waypoint_db -c "SELECT id, username, role FROM \"user\";"
```
