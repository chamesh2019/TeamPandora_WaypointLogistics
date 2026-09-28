-- Waypoint Group Logistics Database Schema (PostgreSQL)
-- Tech-Triathlon 2026: The Intelligent Enterprise

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. ENUMS & DOMAIN TYPES
-- ============================================================================

CREATE TYPE user_role AS ENUM ('dispatcher', 'loader', 'driver', 'store_manager');
CREATE TYPE brand_type AS ENUM ('FRESH', 'STYLE', 'TECH');
CREATE TYPE dock_type AS ENUM ('rear_dock', 'street', 'mall_bay');
CREATE TYPE parking_constraint AS ENUM ('normal', 'van_only', 'mall_dock');
CREATE TYPE vehicle_type AS ENUM ('truck', 'van');
CREATE TYPE vehicle_temp_capability AS ENUM ('reefer', 'ambient');
CREATE TYPE order_temp_requirement AS ENUM ('chilled', 'ambient');
CREATE TYPE vehicle_status AS ENUM ('available', 'in_workshop');

CREATE TYPE order_lifecycle_status AS ENUM (
  'DRAFT',
  'SUBMITTED',
  'CONFIRMED',
  'PLANNED',
  'LOADING',
  'LOAD_EXCEPTION',
  'LOADED',
  'IN_TRANSIT',
  'ARRIVED',
  'DELIVERED',
  'PARTIALLY_DELIVERED',
  'FAILED',
  'DEFERRED',
  'RECEIVED',
  'DISPUTED',
  'RESOLVED'
);

CREATE TYPE trip_status AS ENUM ('PLANNED', 'LOADING', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED');
CREATE TYPE stop_status AS ENUM ('PENDING', 'ARRIVED', 'DELIVERED', 'PARTIAL', 'FAILED', 'SKIPPED');

CREATE TYPE deferral_reason_code AS ENUM (
  'CAPACITY_WEIGHT',
  'CAPACITY_VOLUME',
  'TIME_BUDGET_EXCEEDED',
  'NO_REEFER_AVAILABLE',
  'NO_VAN_AVAILABLE',
  'FUEL_QUOTA_EXCEEDED',
  'WORKSHOP_FLEET_SHORTAGE',
  'AFTER_CUTOFF',
  'OUTLET_WINDOW_MISMATCH'
);

CREATE TYPE load_exception_type AS ENUM (
  'MISSING_STOCK',
  'DAMAGED_CARTON',
  'TEMPERATURE_NONCOMPLIANT',
  'OVERWEIGHT_PALLET'
);

CREATE TYPE dispute_type AS ENUM (
  'DAMAGED_ON_ARRIVAL',
  'SHORTAGE',
  'WRONG_PRODUCT',
  'TEMPERATURE_ABUSE'
);

-- ============================================================================
-- 2. MASTER REFERENCE TABLES
-- ============================================================================

CREATE TABLE depots (
  depot_id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  district VARCHAR(50) NOT NULL,
  latitude DECIMAL(9,6) NOT NULL,
  longitude DECIMAL(9,6) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE brands (
  brand_id brand_type PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  outlets_count INTEGER NOT NULL,
  goods_description VARCHAR(200) NOT NULL,
  delivery_schedule VARCHAR(100) NOT NULL,
  has_chilled_demand BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE districts (
  district_id VARCHAR(50) PRIMARY KEY,
  serving_depot_id VARCHAR(20) NOT NULL REFERENCES depots(depot_id),
  road_class VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE outlets (
  outlet_id VARCHAR(20) PRIMARY KEY,
  brand_id brand_type NOT NULL REFERENCES brands(brand_id),
  district_id VARCHAR(50) NOT NULL REFERENCES districts(district_id),
  depot_id VARCHAR(20) NOT NULL REFERENCES depots(depot_id),
  dock_type dock_type NOT NULL,
  parking_constraint parking_constraint NOT NULL,
  mall_window_open TIME,
  mall_window_close TIME,
  window_open_time TIME NOT NULL,
  window_close_time TIME NOT NULL,
  contact_name VARCHAR(100),
  contact_phone VARCHAR(20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
  user_id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role user_role NOT NULL,
  depot_id VARCHAR(20) REFERENCES depots(depot_id),
  outlet_id VARCHAR(20) REFERENCES outlets(outlet_id),
  phone_number VARCHAR(20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE vehicles (
  vehicle_id VARCHAR(20) PRIMARY KEY,
  type vehicle_type NOT NULL,
  temp vehicle_temp_capability NOT NULL,
  weight_cap_kg DECIMAL(10,2) NOT NULL CHECK (weight_cap_kg > 0),
  volume_cap_m3 DECIMAL(10,2) NOT NULL CHECK (volume_cap_m3 > 0),
  fuel_type VARCHAR(20) NOT NULL,
  km_per_l DECIMAL(5,2) NOT NULL CHECK (km_per_l > 0),
  weekly_fuel_quota_l DECIMAL(8,2) NOT NULL CHECK (weekly_fuel_quota_l > 0),
  depot_id VARCHAR(20) NOT NULL REFERENCES depots(depot_id),
  status vehicle_status NOT NULL DEFAULT 'available',
  assigned_driver_id VARCHAR(36) REFERENCES users(user_id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE calendar (
  calendar_date DATE PRIMARY KEY,
  dow SMALLINT NOT NULL CHECK (dow BETWEEN 0 AND 6),
  dow_name VARCHAR(10) NOT NULL,
  is_weekend BOOLEAN NOT NULL DEFAULT FALSE,
  iso_year INTEGER NOT NULL,
  iso_week INTEGER NOT NULL,
  is_payday BOOLEAN NOT NULL DEFAULT FALSE,
  festival VARCHAR(50),
  festival_ramp DECIMAL(4,3) NOT NULL DEFAULT 0.0 CHECK (festival_ramp BETWEEN 0 AND 1),
  is_holiday BOOLEAN NOT NULL DEFAULT FALSE,
  monsoon BOOLEAN NOT NULL DEFAULT FALSE,
  is_operating BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE district_travel (
  district_id VARCHAR(50) NOT NULL REFERENCES districts(district_id),
  depot_id VARCHAR(20) NOT NULL REFERENCES depots(depot_id),
  road_class VARCHAR(20) NOT NULL,
  free_flow_kmh DECIMAL(5,2) NOT NULL,
  depot_to_district_km DECIMAL(8,2) NOT NULL,
  depot_to_district_freeflow_min DECIMAL(8,2) NOT NULL,
  inter_stop_km DECIMAL(8,2) NOT NULL,
  inter_stop_freeflow_min DECIMAL(8,2) NOT NULL,
  PRIMARY KEY (district_id, depot_id)
);

CREATE TABLE service_allowances (
  brand_id brand_type NOT NULL REFERENCES brands(brand_id),
  dock_type dock_type NOT NULL,
  service_allowance_min DECIMAL(6,2) NOT NULL CHECK (service_allowance_min > 0),
  PRIMARY KEY (brand_id, dock_type)
);

CREATE TABLE traffic_conditions (
  condition_id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
  district_id VARCHAR(50) NOT NULL REFERENCES districts(district_id),
  hour SMALLINT NOT NULL CHECK (hour BETWEEN 0 AND 23),
  monsoon BOOLEAN NOT NULL DEFAULT FALSE,
  speed_index DECIMAL(5,2) NOT NULL DEFAULT 100.00
);

-- ============================================================================
-- 3. ORDERS & DEMAND MANAGEMENT
-- ============================================================================

CREATE TABLE orders (
  order_id VARCHAR(50) PRIMARY KEY,
  outlet_id VARCHAR(20) NOT NULL REFERENCES outlets(outlet_id),
  order_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_after_cutoff BOOLEAN NOT NULL DEFAULT FALSE,
  temp_requirement order_temp_requirement NOT NULL,
  order_units INTEGER NOT NULL CHECK (order_units > 0),
  order_weight_kg DECIMAL(10,2) NOT NULL CHECK (order_weight_kg > 0),
  order_volume_m3 DECIMAL(10,3) NOT NULL CHECK (order_volume_m3 > 0),
  priority_score DECIMAL(6,2) NOT NULL DEFAULT 0.00,
  deferred_yesterday BOOLEAN NOT NULL DEFAULT FALSE,
  consecutive_skips INTEGER NOT NULL DEFAULT 0,
  days_since_last_served INTEGER NOT NULL DEFAULT 1,
  lifecycle_status order_lifecycle_status NOT NULL DEFAULT 'SUBMITTED',
  dispatch_date DATE
);

CREATE TABLE order_items (
  item_id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id VARCHAR(50) NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  sku_code VARCHAR(50) NOT NULL,
  product_name VARCHAR(150) NOT NULL,
  quantity_ordered INTEGER NOT NULL CHECK (quantity_ordered > 0),
  quantity_loaded INTEGER,
  quantity_delivered INTEGER,
  quantity_received INTEGER,
  unit_weight_kg DECIMAL(8,2) NOT NULL,
  unit_volume_m3 DECIMAL(8,4) NOT NULL,
  is_chilled BOOLEAN NOT NULL DEFAULT FALSE
);

-- ============================================================================
-- 4. PLANNING, ALLOCATION & TRIPS
-- ============================================================================

CREATE TABLE allocation_plans (
  plan_id VARCHAR(50) PRIMARY KEY,
  plan_date DATE NOT NULL,
  depot_id VARCHAR(20) NOT NULL REFERENCES depots(depot_id),
  dispatcher_id VARCHAR(36) NOT NULL REFERENCES users(user_id),
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
  total_orders INTEGER NOT NULL DEFAULT 0,
  served_orders INTEGER NOT NULL DEFAULT 0,
  deferred_orders INTEGER NOT NULL DEFAULT 0,
  total_weight_kg DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_volume_m3 DECIMAL(10,3) NOT NULL DEFAULT 0.000,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE trips (
  trip_id VARCHAR(50) PRIMARY KEY,
  plan_id VARCHAR(50) NOT NULL REFERENCES allocation_plans(plan_id),
  vehicle_id VARCHAR(20) NOT NULL REFERENCES vehicles(vehicle_id),
  trip_number SMALLINT NOT NULL CHECK (trip_number IN (1, 2)),
  brand_id brand_type NOT NULL REFERENCES brands(brand_id),
  district_id VARCHAR(50) NOT NULL REFERENCES districts(district_id),
  depot_id VARCHAR(20) NOT NULL REFERENCES depots(depot_id),
  driver_id VARCHAR(36) NOT NULL REFERENCES users(user_id),
  status trip_status NOT NULL DEFAULT 'PLANNED',
  total_orders_count INTEGER NOT NULL CHECK (total_orders_count >= 1),
  total_weight_kg DECIMAL(10,2) NOT NULL,
  total_volume_m3 DECIMAL(10,3) NOT NULL,
  outbound_travel_min DECIMAL(8,2) NOT NULL,
  inter_stop_travel_min DECIMAL(8,2) NOT NULL,
  total_handling_min DECIMAL(8,2) NOT NULL,
  total_trip_minutes DECIMAL(8,2) NOT NULL,
  max_time_budget_min INTEGER NOT NULL,
  planned_departure_time TIME NOT NULL,
  planned_return_time TIME NOT NULL,
  actual_departure_time TIMESTAMPTZ,
  actual_return_time TIMESTAMPTZ,
  estimated_fuel_liters DECIMAL(8,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE trip_stops (
  stop_id VARCHAR(50) PRIMARY KEY,
  trip_id VARCHAR(50) NOT NULL REFERENCES trips(trip_id) ON DELETE CASCADE,
  order_id VARCHAR(50) NOT NULL UNIQUE REFERENCES orders(order_id),
  outlet_id VARCHAR(20) NOT NULL REFERENCES outlets(outlet_id),
  stop_sequence SMALLINT NOT NULL CHECK (stop_sequence >= 0),
  load_sequence SMALLINT NOT NULL,
  planned_arrival_time TIME NOT NULL,
  predicted_service_min DECIMAL(6,2),
  predicted_late_prob DECIMAL(4,3),
  actual_arrival_time TIMESTAMPTZ,
  actual_depart_time TIMESTAMPTZ,
  actual_service_min DECIMAL(6,2),
  is_late BOOLEAN NOT NULL DEFAULT FALSE,
  status stop_status NOT NULL DEFAULT 'PENDING'
);

CREATE TABLE deferrals (
  deferral_id VARCHAR(50) PRIMARY KEY,
  plan_id VARCHAR(50) NOT NULL REFERENCES allocation_plans(plan_id),
  order_id VARCHAR(50) NOT NULL REFERENCES orders(order_id),
  outlet_id VARCHAR(20) NOT NULL REFERENCES outlets(outlet_id),
  reason_code deferral_reason_code NOT NULL,
  reason_notes TEXT NOT NULL,
  recorded_by_id VARCHAR(36) NOT NULL REFERENCES users(user_id),
  priority_boost INTEGER NOT NULL DEFAULT 1,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE route_legs (
  leg_id VARCHAR(50) PRIMARY KEY,
  trip_id VARCHAR(50) NOT NULL REFERENCES trips(trip_id) ON DELETE CASCADE,
  seq SMALLINT NOT NULL CHECK (seq >= 0),
  from_point VARCHAR(50) NOT NULL,
  to_outlet VARCHAR(20) NOT NULL REFERENCES outlets(outlet_id),
  distance_km DECIMAL(8,2) NOT NULL,
  planned_depart_time TIME NOT NULL,
  planned_travel_duration_min DECIMAL(8,2) NOT NULL,
  planned_arrival_time TIME NOT NULL,
  actual_depart_time TIMESTAMPTZ,
  actual_travel_duration_min DECIMAL(8,2),
  actual_arrival_time TIMESTAMPTZ,
  leave_outlet_time TIMESTAMPTZ
);

-- ============================================================================
-- 5. WAREHOUSE DOCK & LOADING OPERATIONS
-- ============================================================================

CREATE TABLE loading_manifests (
  manifest_id VARCHAR(50) PRIMARY KEY,
  trip_id VARCHAR(50) NOT NULL UNIQUE REFERENCES trips(trip_id),
  loader_id VARCHAR(36) NOT NULL REFERENCES users(user_id),
  status VARCHAR(30) NOT NULL DEFAULT 'QUEUED',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE TABLE loading_exceptions (
  exception_id VARCHAR(50) PRIMARY KEY,
  manifest_id VARCHAR(50) NOT NULL REFERENCES loading_manifests(manifest_id),
  order_id VARCHAR(50) NOT NULL REFERENCES orders(order_id),
  item_id VARCHAR(36) REFERENCES order_items(item_id),
  flagged_by_id VARCHAR(36) NOT NULL REFERENCES users(user_id),
  exception_type load_exception_type NOT NULL,
  quantity_short INTEGER NOT NULL CHECK (quantity_short > 0),
  resolution VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  resolved_by_id VARCHAR(36) REFERENCES users(user_id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 6. MOBILE DRIVER EXECUTION & PROOF OF DELIVERY
-- ============================================================================

CREATE TABLE proof_of_deliveries (
  pod_id VARCHAR(50) PRIMARY KEY,
  stop_id VARCHAR(50) NOT NULL UNIQUE REFERENCES trip_stops(stop_id),
  order_id VARCHAR(50) NOT NULL REFERENCES orders(order_id),
  driver_id VARCHAR(36) NOT NULL REFERENCES users(user_id),
  recipient_name VARCHAR(100) NOT NULL,
  recipient_title VARCHAR(50),
  signature_url VARCHAR(255) NOT NULL,
  photo_urls JSONB DEFAULT '[]'::jsonb,
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),
  notes TEXT,
  delivered_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE offline_event_queue (
  event_id VARCHAR(36) PRIMARY KEY,
  driver_id VARCHAR(36) NOT NULL REFERENCES users(user_id),
  trip_id VARCHAR(50) NOT NULL REFERENCES trips(trip_id),
  event_type VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,
  client_timestamp TIMESTAMPTZ NOT NULL,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reconciliation_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  reconciliation_notes TEXT
);

-- ============================================================================
-- 7. STORE RECEIPT & DISPUTE CLAIMS
-- ============================================================================

CREATE TABLE receipt_confirmations (
  receipt_id VARCHAR(50) PRIMARY KEY,
  order_id VARCHAR(50) NOT NULL UNIQUE REFERENCES orders(order_id),
  store_manager_id VARCHAR(36) NOT NULL REFERENCES users(user_id),
  status VARCHAR(30) NOT NULL,
  confirmed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE disputes (
  dispute_id VARCHAR(50) PRIMARY KEY,
  order_id VARCHAR(50) NOT NULL REFERENCES orders(order_id),
  item_id VARCHAR(36) REFERENCES order_items(item_id),
  reported_by_id VARCHAR(36) NOT NULL REFERENCES users(user_id),
  dispute_type dispute_type NOT NULL,
  units_affected INTEGER NOT NULL CHECK (units_affected > 0),
  store_notes TEXT NOT NULL,
  evidence_photo_urls JSONB DEFAULT '[]'::jsonb,
  resolution_status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
  resolution_notes TEXT,
  resolved_by_id VARCHAR(36) REFERENCES users(user_id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 8. FUEL & AUDIT LEDGER
-- ============================================================================

CREATE TABLE vehicle_fuel_ledgers (
  ledger_id VARCHAR(50) PRIMARY KEY,
  vehicle_id VARCHAR(20) NOT NULL REFERENCES vehicles(vehicle_id),
  iso_year INTEGER NOT NULL,
  iso_week INTEGER NOT NULL,
  trip_id VARCHAR(50) NOT NULL REFERENCES trips(trip_id),
  distance_km DECIMAL(8,2) NOT NULL,
  fuel_consumed_liters DECIMAL(8,2) NOT NULL,
  cumulative_used_liters DECIMAL(8,2) NOT NULL,
  weekly_quota_liters DECIMAL(8,2) NOT NULL,
  remaining_quota_liters DECIMAL(8,2) NOT NULL,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 9. DATATHON ML FORECASTS & PREDICTIONS
-- ============================================================================

CREATE TABLE demand_forecasts (
  forecast_id VARCHAR(50) PRIMARY KEY,
  row_id VARCHAR(20) NOT NULL UNIQUE,
  depot_id VARCHAR(20) NOT NULL REFERENCES depots(depot_id),
  brand_id brand_type NOT NULL REFERENCES brands(brand_id),
  iso_year INTEGER NOT NULL,
  iso_week INTEGER NOT NULL,
  pred_total_volume_m3 DECIMAL(10,3) NOT NULL,
  pred_chilled_volume_m3 DECIMAL(10,3) NOT NULL,
  model_version VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE delivery_predictions (
  delivery_id VARCHAR(50) PRIMARY KEY REFERENCES orders(order_id),
  pred_service_min DECIMAL(6,2) NOT NULL,
  pred_late_prob DECIMAL(4,3) NOT NULL CHECK (pred_late_prob BETWEEN 0 AND 1),
  model_version VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 10. INDEXES FOR PERFORMANCE & CONSTRAINTS
-- ============================================================================

CREATE INDEX idx_orders_planning ON orders (order_date, lifecycle_status, is_after_cutoff);
CREATE INDEX idx_orders_outlet ON orders (outlet_id);
CREATE INDEX idx_vehicles_depot ON vehicles (depot_id, status, type, temp);
CREATE INDEX idx_trips_vehicle ON trips (vehicle_id, plan_id);
CREATE INDEX idx_trip_stops_seq ON trip_stops (trip_id, stop_sequence);
CREATE INDEX idx_trip_stops_load ON trip_stops (trip_id, load_sequence);
CREATE INDEX idx_fuel_weekly ON vehicle_fuel_ledgers (vehicle_id, iso_year, iso_week);
CREATE INDEX idx_offline_sync ON offline_event_queue (reconciliation_status, client_timestamp);
