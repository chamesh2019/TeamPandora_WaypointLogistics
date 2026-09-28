-- Waypoint Group Initial Seed Data
-- Tech-Triathlon 2026 Master Data & Seed Delivery Scenario

-- ============================================================================
-- 1. SEED DEPOTS
-- ============================================================================
INSERT INTO depots (depot_id, name, district, latitude, longitude, is_active)
VALUES
  ('PELIYAGODA', 'Peliyagoda Distribution Center', 'Gampaha', 6.965400, 79.897800, TRUE),
  ('KANDY', 'Kandy Regional Hub', 'Kandy', 7.290600, 80.633700, TRUE)
ON CONFLICT (depot_id) DO NOTHING;

-- ============================================================================
-- 2. SEED BRANDS
-- ============================================================================
INSERT INTO brands (brand_id, name, outlets_count, goods_description, delivery_schedule, has_chilled_demand)
VALUES
  ('FRESH', 'Waypoint Fresh', 80, 'Groceries, chilled and frozen goods, dairy, produce', 'Daily; before stores open at 8 AM', TRUE),
  ('STYLE', 'Waypoint Style', 25, 'Hanging garments and cartons; high volume ratio', 'Weekly, with seasonal peaks', FALSE),
  ('TECH', 'Waypoint Tech', 15, 'Appliances and consumer electronics; heavy and fragile', 'As needed; high-value goods', FALSE)
ON CONFLICT (brand_id) DO NOTHING;

-- ============================================================================
-- 3. SEED DISTRICTS
-- ============================================================================
INSERT INTO districts (district_id, serving_depot_id, road_class)
VALUES
  ('Colombo', 'PELIYAGODA', 'urban'),
  ('Gampaha', 'PELIYAGODA', 'suburban'),
  ('Kalutara', 'PELIYAGODA', 'suburban'),
  ('Galle', 'PELIYAGODA', 'highway'),
  ('Matara', 'PELIYAGODA', 'highway'),
  ('Hambantota', 'PELIYAGODA', 'highway'),
  ('Kurunegala', 'PELIYAGODA', 'suburban'),
  ('Puttalam', 'PELIYAGODA', 'suburban'),
  ('Kegalle', 'PELIYAGODA', 'hill'),
  ('Kandy', 'KANDY', 'hill'),
  ('Matale', 'KANDY', 'hill'),
  ('Nuwara Eliya', 'KANDY', 'hill')
ON CONFLICT (district_id) DO NOTHING;

-- ============================================================================
-- 4. SEED SERVICE ALLOWANCES (service_allowance.csv)
-- ============================================================================
INSERT INTO service_allowances (brand_id, dock_type, service_allowance_min)
VALUES
  ('FRESH', 'rear_dock', 15.00),
  ('FRESH', 'street', 16.00),
  ('FRESH', 'mall_bay', 20.00),
  ('STYLE', 'rear_dock', 25.00),
  ('STYLE', 'street', 30.00),
  ('STYLE', 'mall_bay', 35.00),
  ('TECH', 'rear_dock', 20.00),
  ('TECH', 'street', 25.00),
  ('TECH', 'mall_bay', 30.00)
ON CONFLICT (brand_id, dock_type) DO NOTHING;

-- ============================================================================
-- 5. SEED DISTRICT TRAVEL MATRIX (district_travel.csv sample)
-- ============================================================================
INSERT INTO district_travel (district_id, depot_id, road_class, free_flow_kmh, depot_to_district_km, depot_to_district_freeflow_min, inter_stop_km, inter_stop_freeflow_min)
VALUES
  ('Colombo', 'PELIYAGODA', 'urban', 35.00, 12.00, 24.00, 3.50, 8.00),
  ('Gampaha', 'PELIYAGODA', 'suburban', 45.00, 25.00, 37.00, 5.00, 9.00),
  ('Kalutara', 'PELIYAGODA', 'suburban', 50.00, 48.00, 58.00, 7.00, 12.00),
  ('Kandy', 'KANDY', 'hill', 30.00, 8.00, 18.00, 3.00, 10.00),
  ('Matale', 'KANDY', 'hill', 35.00, 28.00, 45.00, 6.00, 14.00),
  ('Nuwara Eliya', 'KANDY', 'hill', 25.00, 65.00, 110.00, 8.00, 20.00)
ON CONFLICT (district_id, depot_id) DO NOTHING;

-- ============================================================================
-- 6. SEED OUTLETS (Representative 15 outlets across brands & constraints)
-- ============================================================================
INSERT INTO outlets (outlet_id, brand_id, district_id, depot_id, dock_type, parking_constraint, mall_window_open, mall_window_close, window_open_time, window_close_time, contact_name, contact_phone)
VALUES
  -- Fresh Outlets (Colombo / Gampaha / Kandy)
  ('OUT001', 'FRESH', 'Colombo', 'PELIYAGODA', 'rear_dock', 'normal', NULL, NULL, '03:30:00', '08:00:00', 'Anura Silva', '0771234501'),
  ('OUT002', 'FRESH', 'Colombo', 'PELIYAGODA', 'street', 'van_only', NULL, NULL, '04:00:00', '08:00:00', 'Chaminda Bandara', '0771234502'),
  ('OUT003', 'FRESH', 'Gampaha', 'PELIYAGODA', 'rear_dock', 'normal', NULL, NULL, '03:30:00', '08:00:00', 'Rohan Wickramasinghe', '0771234503'),
  ('OUT004', 'FRESH', 'Gampaha', 'PELIYAGODA', 'street', 'normal', NULL, NULL, '04:00:00', '08:00:00', 'Dhammika Perera', '0771234504'),
  ('OUT005', 'FRESH', 'Kandy', 'KANDY', 'rear_dock', 'normal', NULL, NULL, '03:30:00', '08:00:00', 'Prasanna Alwis', '0771234505'),
  ('OUT006', 'FRESH', 'Kandy', 'KANDY', 'street', 'van_only', NULL, NULL, '04:00:00', '08:00:00', 'Lalith Senanayake', '0771234506'),
  ('OUT007', 'FRESH', 'Colombo', 'PELIYAGODA', 'rear_dock', 'normal', NULL, NULL, '03:30:00', '08:00:00', 'Nuwan Dissanayake', '0771234507'),
  ('OUT008', 'FRESH', 'Colombo', 'PELIYAGODA', 'street', 'normal', NULL, NULL, '04:00:00', '08:00:00', 'Kasun Weerasinghe', '0771234508'),

  -- Style Outlets (Malls & High Streets)
  ('OUT081', 'STYLE', 'Colombo', 'PELIYAGODA', 'mall_bay', 'mall_dock', '09:00:00', '12:00:00', '09:00:00', '12:00:00', 'Samanthi Fonseka', '0771234581'),
  ('OUT082', 'STYLE', 'Gampaha', 'PELIYAGODA', 'rear_dock', 'normal', NULL, NULL, '08:30:00', '17:00:00', 'Dilrukshi Karunaratne', '0771234582'),
  ('OUT083', 'STYLE', 'Kandy', 'KANDY', 'mall_bay', 'mall_dock', '10:00:00', '13:00:00', '10:00:00', '13:00:00', 'Chathurika Jayawardena', '0771234583'),
  ('OUT084', 'STYLE', 'Colombo', 'PELIYAGODA', 'street', 'normal', NULL, NULL, '09:00:00', '16:00:00', 'Nadeesha Madushani', '0771234584'),

  -- Tech Outlets (High-value appliances)
  ('OUT106', 'TECH', 'Colombo', 'PELIYAGODA', 'rear_dock', 'normal', NULL, NULL, '09:00:00', '18:00:00', 'Ruwan Jayasuriya', '0771234606'),
  ('OUT107', 'TECH', 'Gampaha', 'PELIYAGODA', 'street', 'normal', NULL, NULL, '09:00:00', '18:00:00', 'Mahesh Samarasinghe', '0771234607'),
  ('OUT108', 'TECH', 'Kandy', 'KANDY', 'street', 'van_only', NULL, NULL, '09:00:00', '18:00:00', 'Tharindu Rathnayake', '0771234608')
ON CONFLICT (outlet_id) DO NOTHING;

-- ============================================================================
-- 7. SEED USERS (The 4 Seeded Accounts Required for Judging)
-- ============================================================================
-- Passwords below are pre-hashed for convenience (or can be validated directly)
INSERT INTO users (user_id, username, password_hash, full_name, role, depot_id, outlet_id, phone_number)
VALUES
  -- 1. Dispatcher (Peliyagoda control tower)
  ('usr-disp-001', 'dispatcher', 'dispatch123', 'Sarath Gunawardena', 'dispatcher', 'PELIYAGODA', NULL, '0714455661'),
  -- 2. Loader (Warehouse loading dock)
  ('usr-load-001', 'loader', 'loader123', 'Sunil Jayasinghe', 'loader', 'PELIYAGODA', NULL, '0714455662'),
  -- 3. Driver (Mobile delivery driver)
  ('usr-driv-001', 'driver', 'driver123', 'Nimal Fernando', 'driver', 'PELIYAGODA', NULL, '0714455663'),
  -- 4. Store Manager (Fresh outlet OUT001)
  ('usr-stor-001', 'store_manager', 'store123', 'Anura Silva', 'store_manager', NULL, 'OUT001', '0771234501')
ON CONFLICT (username) DO NOTHING;

-- ============================================================================
-- 8. SEED VEHICLES (Representative fleet including reefers, vans, and workshop)
-- ============================================================================
INSERT INTO vehicles (vehicle_id, type, temp, weight_cap_kg, volume_cap_m3, fuel_type, km_per_l, weekly_fuel_quota_l, depot_id, status, assigned_driver_id)
VALUES
  -- Peliyagoda Fleet
  ('VEH001', 'truck', 'reefer', 5000.00, 26.00, 'diesel', 4.20, 250.00, 'PELIYAGODA', 'available', 'usr-driv-001'),
  ('VEH002', 'truck', 'ambient', 6000.00, 32.00, 'diesel', 4.50, 250.00, 'PELIYAGODA', 'available', NULL),
  ('VEH003', 'truck', 'ambient', 6000.00, 32.00, 'diesel', 4.50, 250.00, 'PELIYAGODA', 'available', NULL),
  ('VEH004', 'truck', 'reefer', 5000.00, 26.00, 'diesel', 4.20, 250.00, 'PELIYAGODA', 'available', NULL),
  ('VEH013', 'van', 'reefer', 1500.00, 8.00, 'diesel', 7.50, 140.00, 'PELIYAGODA', 'available', NULL),
  ('VEH014', 'van', 'ambient', 1500.00, 8.00, 'diesel', 8.00, 140.00, 'PELIYAGODA', 'available', NULL),
  ('VEH015', 'truck', 'ambient', 6000.00, 32.00, 'diesel', 4.50, 250.00, 'PELIYAGODA', 'in_workshop', NULL),

  -- Kandy Fleet
  ('VEH021', 'truck', 'reefer', 5000.00, 26.00, 'diesel', 3.80, 250.00, 'KANDY', 'available', NULL),
  ('VEH022', 'truck', 'ambient', 6000.00, 32.00, 'diesel', 4.00, 250.00, 'KANDY', 'available', NULL),
  ('VEH025', 'van', 'reefer', 1500.00, 8.00, 'diesel', 6.80, 140.00, 'KANDY', 'available', NULL)
ON CONFLICT (vehicle_id) DO NOTHING;

-- ============================================================================
-- 9. SEED CALENDAR
-- ============================================================================
INSERT INTO calendar (calendar_date, dow, dow_name, is_weekend, iso_year, iso_week, is_payday, festival, festival_ramp, is_holiday, monsoon, is_operating)
VALUES
  ('2026-10-01', 3, 'Thursday', FALSE, 2026, 40, FALSE, NULL, 0.20, FALSE, FALSE, TRUE),
  ('2026-10-02', 4, 'Friday', FALSE, 2026, 40, FALSE, NULL, 0.30, FALSE, FALSE, TRUE),
  ('2026-10-03', 5, 'Saturday', TRUE, 2026, 40, FALSE, NULL, 0.40, FALSE, FALSE, TRUE)
ON CONFLICT (calendar_date) DO NOTHING;

-- ============================================================================
-- 10. SEED SAMPLE ORDERS (Realistic Delivery Run for Date 2026-10-01)
-- ============================================================================
INSERT INTO orders (order_id, outlet_id, order_date, created_at, is_after_cutoff, temp_requirement, order_units, order_weight_kg, order_volume_m3, priority_score, deferred_yesterday, consecutive_skips, days_since_last_served, lifecycle_status)
VALUES
  -- Fresh Orders (Colombo)
  ('ORD-20261001-001', 'OUT001', '2026-10-01', '2026-09-30 14:10:00', FALSE, 'chilled', 45, 850.00, 4.500, 8.50, FALSE, 0, 1, 'CONFIRMED'),
  ('ORD-20261001-002', 'OUT001', '2026-10-01', '2026-09-30 14:12:00', FALSE, 'ambient', 60, 1100.00, 5.200, 7.50, FALSE, 0, 1, 'CONFIRMED'),
  -- Van-only Fresh store (requires reefer van VEH013)
  ('ORD-20261001-003', 'OUT002', '2026-10-01', '2026-09-30 15:00:00', FALSE, 'chilled', 25, 420.00, 2.800, 9.00, TRUE, 1, 2, 'CONFIRMED'),
  ('ORD-20261001-004', 'OUT007', '2026-10-01', '2026-09-30 15:30:00', FALSE, 'chilled', 30, 600.00, 3.200, 7.00, FALSE, 0, 1, 'CONFIRMED'),
  
  -- Fresh Orders (Gampaha)
  ('ORD-20261001-005', 'OUT003', '2026-10-01', '2026-09-30 13:45:00', FALSE, 'ambient', 70, 1400.00, 6.500, 6.50, FALSE, 0, 1, 'CONFIRMED'),
  ('ORD-20261001-006', 'OUT004', '2026-10-01', '2026-09-30 15:50:00', FALSE, 'ambient', 55, 980.00, 4.800, 6.00, FALSE, 0, 1, 'CONFIRMED'),

  -- Style Order (Mall delivery)
  ('ORD-20261001-007', 'OUT081', '2026-10-01', '2026-09-30 11:20:00', FALSE, 'ambient', 120, 950.00, 18.000, 6.00, FALSE, 0, 4, 'CONFIRMED'),

  -- Tech Order (Heavy appliances)
  ('ORD-20261001-008', 'OUT106', '2026-10-01', '2026-09-30 10:15:00', FALSE, 'ambient', 14, 2200.00, 8.500, 5.50, FALSE, 0, 5, 'CONFIRMED')
ON CONFLICT (order_id) DO NOTHING;

-- Seed line items for ORD-20261001-001 (for loading check & dispute walkthrough)
INSERT INTO order_items (item_id, order_id, sku_code, product_name, quantity_ordered, quantity_loaded, quantity_delivered, quantity_received, unit_weight_kg, unit_volume_m3, is_chilled)
VALUES
  ('itm-001', 'ORD-20261001-001', 'SKU-DAIRY-01', 'Fresh Milk 1L Crates (12 pk)', 20, 20, 20, 20, 13.00, 0.070, TRUE),
  ('itm-002', 'ORD-20261001-001', 'SKU-DAIRY-02', 'Farm Butter 500g Box (24 pk)', 15, 15, 15, 15, 12.50, 0.050, TRUE),
  ('itm-003', 'ORD-20261001-001', 'SKU-MEAT-01', 'Chicken Breast Cold Pack 5kg', 10, 10, 10, 10, 5.20, 0.025, TRUE)
ON CONFLICT (item_id) DO NOTHING;
