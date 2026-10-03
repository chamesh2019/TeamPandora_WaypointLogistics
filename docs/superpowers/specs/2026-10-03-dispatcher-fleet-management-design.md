# Design Specification: Dispatcher Fleet Management

**Author**: Waypoint Logistics Engineering  
**Date**: 2026-10-03  
**Status**: Approved  

---

## 1. Overview & Objectives

The Fleet Management section of the Dispatcher Dashboard (`/dispatcher/fleet`) allows dispatchers to monitor vehicle telemetry, track depot vehicle availability, inspect fuel quota consumption, manage workshop maintenance states, and assign/reassign default drivers.

### Key Objectives
1. **Live PostgreSQL Integration**: Transition the fleet dashboard from static mock data to live database state (`vehicles`, `depots`, `trips`, `vehicle_fuel_ledgers`, `users`).
2. **Operational Status Mapping**: Derive three operational statuses from database attributes and active trips:
   - **`Workshop`**: Vehicle has `vehicles.status = 'in_workshop'`.
   - **`Active`**: Vehicle has `vehicles.status = 'available'` and is assigned to a trip with status `PLANNED`, `LOADING`, or `IN_TRANSIT`.
   - **`Idle`**: Vehicle has `vehicles.status = 'available'` and has no active trip in progress (ready for dispatch).
3. **Dedicated KPI Metrics & 10-Day Historical Trend Endpoint**:
   - Provide `GET /api/dispatcher/fleet/kpis` delivering current totals and the last 10 days of historical trend data for:
     1. Total Fleet
     2. Available Fleet
     3. Reefer Vehicles
     4. In Workshop
   - Render 10-day graduated bar charts directly on each KPI card.
4. **Interactive Dispatcher Actions**:
   - **Maintenance Mode**: Toggle vehicle status between `available` and `in_workshop` (with safety validation preventing vehicles on active trips from entering the workshop).
   - **Driver Assignment**: Assign, change, or unassign default drivers for vehicles.
   - **Telematics & Diagnostics Modal**: View fuel quota usage, fuel efficiency (km/L), odometer, weight/volume capacity, and current assignment details.
   - **Filters & Search**: Multi-depot scoping (`Peliyagoda`, `Kandy`), status filters (`All`, `Active`, `Idle`, `Workshop`), vehicle type filtering (`Reefer Truck`, `Ambient Box`, `Van`), search bar, and CSV export.

---

## 2. API Endpoints & Data Contracts

### 2.1 `GET /api/dispatcher/fleet`
Retrieves the fleet vehicle roster, current driver list, and current KPI summary.

- **Query Parameters**:
  - `depotId` (optional, string): Filter by depot (`PELIYAGODA`, `KANDY`).
  - `status` (optional, string): Filter by operational status (`Active`, `Idle`, `Workshop`).
  - `type` (optional, string): Filter by vehicle type (`truck`, `van`) or temperature (`reefer`, `ambient`).
  - `search` (optional, string): Case-insensitive search on vehicle ID, driver name, depot, or active trip ID.

- **Response Body (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "kpis": {
        "totalFleet": 10,
        "available": 8,
        "active": 1,
        "reeferCount": 5,
        "inWorkshop": 1
      },
      "vehicles": [
        {
          "id": "VEH001",
          "type": "truck",
          "temp": "reefer",
          "weightCapKg": 5000,
          "volumeCapM3": 26,
          "fuelType": "diesel",
          "kmPerL": 4.2,
          "weeklyFuelQuotaL": 250,
          "fuelUsedThisWeekL": 42.5,
          "fuelRemainingL": 207.5,
          "fuelPct": 83,
          "depotId": "PELIYAGODA",
          "dbStatus": "available",
          "operationalStatus": "Active",
          "assignedDriverId": "usr-driv-001",
          "assignedDriverName": "N. Perera",
          "assignedDriverPhone": "+94 77 123 4567",
          "activeTripId": "TRP-20261003-01",
          "activeTripStatus": "PLANNED",
          "odometerKm": 84320,
          "engineTemp": "88°C (Normal)",
          "lastService": "Verified"
        }
      ],
      "drivers": [
        { "id": "usr-driv-001", "name": "N. Perera", "phone": "+94 77 123 4567" },
        { "id": "usr-driv-002", "name": "S. Bandara", "phone": "+94 77 234 5678" }
      ]
    }
  }
  ```

---

### 2.2 `PATCH /api/dispatcher/fleet`
Updates a vehicle's maintenance status or assigned driver.

- **Request Body**:
  ```json
  {
    "vehicleId": "VEH001",
    "status": "in_workshop", // or "available" (optional)
    "driverId": "usr-driv-002" // or null to unassign (optional)
  }
  ```

- **Validation Rules**:
  1. `vehicleId` must exist in `vehicles`.
  2. If `status === 'in_workshop'`: The vehicle cannot be on an active trip with status `LOADING` or `IN_TRANSIT` (returns `400 BAD_REQUEST`). If on a `PLANNED` trip, rejection response asks dispatcher to unassign or cancel trip first.
  3. If `driverId` is passed, must be a valid user with role `driver`.

- **Response Body (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "vehicleId": "VEH001",
      "status": "in_workshop",
      "assignedDriverId": "usr-driv-002"
    }
  }
  ```

---

### 2.3 `GET /api/dispatcher/fleet/kpis`
Retrieves current KPI totals and a 10-day daily time-series array for each KPI card.

- **Query Parameters**:
  - `depotId` (optional, string): Scope KPIs to specific depot.

- **Response Body (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "depotId": "ALL",
      "days": 10,
      "metrics": {
        "totalFleet": {
          "current": 10,
          "subtitle": "Both depots",
          "history": [
            { "date": "2026-09-24", "value": 10 },
            { "date": "2026-09-25", "value": 10 },
            { "date": "2026-10-03", "value": 10 }
          ]
        },
        "available": {
          "current": 8,
          "subtitle": "Ready for dispatch",
          "history": [
            { "date": "2026-09-24", "value": 7 },
            { "date": "2026-09-25", "value": 8 },
            { "date": "2026-10-03", "value": 8 }
          ]
        },
        "reeferTrucks": {
          "current": 5,
          "subtitle": "4 available now",
          "history": [
            { "date": "2026-09-24", "value": 5 },
            { "date": "2026-09-25", "value": 5 },
            { "date": "2026-10-03", "value": 5 }
          ]
        },
        "inWorkshop": {
          "current": 1,
          "subtitle": "Est. 2 days avg",
          "history": [
            { "date": "2026-09-24", "value": 2 },
            { "date": "2026-09-25", "value": 1 },
            { "date": "2026-10-03", "value": 1 }
          ]
        }
      }
    }
  }
  ```

---

## 3. Database Layer & Service Methods

### 3.1 Queries in `DispatcherService` (`lib/services/dispatcher-service.ts`)
- **`getFleet(options)`**:
  - Uses `vehicles v` joined with `users u` on `v.assigned_driver_id = u.user_id`.
  - Joins `trips t` on `v.vehicle_id = t.vehicle_id AND t.status IN ('PLANNED', 'LOADING', 'IN_TRANSIT')` to get the latest active trip.
  - Subqueries `vehicle_fuel_ledgers` grouped by `vehicle_id` for current ISO year/week.
  - Aggregates KPIs in the same service query or via helper.
  - Fetches list of drivers from `users WHERE role = 'driver'`.
- **`updateVehicle(vehicleId, payload)`**:
  - Checks current active trip if `status = 'in_workshop'` requested.
  - Runs parameterized `UPDATE vehicles SET ... WHERE vehicle_id = $1`.
- **`getFleetKpis(options)`**:
  - Queries active vehicles and trips across the last 10 calendar days.
  - Calculates daily counts for total fleet, active trips, workshop counts, and ready fleet.

---

## 4. Frontend UI Components (`app/dispatcher/fleet/page.tsx`)

### 4.1 State & Effects
- `fleet`: array of `DispatcherFleetVehicleDto`.
- `kpisData`: KPI structure containing 10-day historical points from `/api/dispatcher/fleet/kpis`.
- `drivers`: driver roster for modal assignment.
- `isLoading`: loading state with skeleton cards and table placeholder.
- `toastMessage`: feedback toast on update/error.

### 4.2 Interactive Elements
- **10-day Bar Charts**: Each of the 4 KPI cards maps its `history` array (10 points) into the 10 mini bars, scaling bar heights relative to maximum values, with tooltip showing date and value.
- **Diagnostics Modal**: Displays live fuel quota vs consumed, engine state, odometer, capacities, and quick action buttons.
- **Assign Driver Modal**: Connects to `PATCH /api/dispatcher/fleet` to update assigned driver.
- **Workshop Maintenance Action**: Puts idle vehicle into workshop or releases back to available pool.
- **Filter Drawer & Search**: Filter by depot, status, type; live search query; export to CSV.

---

## 5. Verification & Testing Plan

1. **Unit & API Route Tests**:
   - `tests/api-dispatcher-fleet.test.ts`:
     - Test `GET /api/dispatcher/fleet`: returns 200 with vehicle list and drivers.
     - Test `GET /api/dispatcher/fleet/kpis`: returns 10-day history for all 4 KPIs.
     - Test `PATCH /api/dispatcher/fleet`: successfully updates driver and workshop status.
     - Test validation: blocks moving vehicle with active trip into workshop.
2. **UI & End-to-End Verification**:
   - Verify page renders at `/dispatcher/fleet` without console errors.
   - Verify KPI cards render the 10-day trend bars correctly.
   - Verify vehicle status transitions between Idle and Workshop.
   - Verify driver assignment updates.
   - Verify CSV export contains live data.
