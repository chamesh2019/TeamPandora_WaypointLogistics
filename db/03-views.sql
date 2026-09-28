-- Waypoint Group Database Views
-- Tech-Triathlon 2026: Role-Based Views & Feasibility Validator

-- ============================================================================
-- 1. STORE MANAGER VIEWS
-- ============================================================================

CREATE OR REPLACE VIEW view_store_order_history AS
SELECT 
  o.order_id,
  o.outlet_id,
  outl.brand_id,
  o.order_date,
  o.created_at,
  o.is_after_cutoff,
  o.temp_requirement,
  o.order_units,
  o.order_weight_kg,
  o.order_volume_m3,
  o.lifecycle_status,
  o.consecutive_skips,
  o.dispatch_date
FROM orders o
JOIN outlets outl ON o.outlet_id = outl.outlet_id;

CREATE OR REPLACE VIEW view_store_incoming_deliveries AS
SELECT 
  o.order_id,
  o.outlet_id,
  o.order_date,
  o.lifecycle_status,
  ts.planned_arrival_time,
  ts.actual_arrival_time,
  ts.is_late,
  t.trip_id,
  t.trip_number,
  t.status AS trip_status,
  v.vehicle_id,
  v.type AS vehicle_type,
  v.temp AS vehicle_temp,
  u.full_name AS driver_name,
  u.phone_number AS driver_phone
FROM orders o
JOIN trip_stops ts ON o.order_id = ts.order_id
JOIN trips t ON ts.trip_id = t.trip_id
JOIN vehicles v ON t.vehicle_id = v.vehicle_id
JOIN users u ON t.driver_id = u.user_id;

CREATE OR REPLACE VIEW view_store_deferrals AS
SELECT 
  d.deferral_id,
  d.order_id,
  d.outlet_id,
  o.order_date,
  o.temp_requirement,
  o.order_units,
  o.order_weight_kg,
  o.order_volume_m3,
  d.reason_code,
  d.reason_notes,
  d.priority_boost,
  d.recorded_at,
  o.consecutive_skips
FROM deferrals d
JOIN orders o ON d.order_id = o.order_id;

CREATE OR REPLACE VIEW view_store_pending_receipts AS
SELECT 
  o.order_id,
  o.outlet_id,
  o.order_date,
  pod.pod_id,
  pod.delivered_at,
  pod.recipient_name,
  pod.signature_url,
  pod.photo_urls,
  pod.notes AS driver_notes,
  u.full_name AS driver_name
FROM orders o
JOIN proof_of_deliveries pod ON o.order_id = pod.order_id
JOIN users u ON pod.driver_id = u.user_id
LEFT JOIN receipt_confirmations rc ON o.order_id = rc.order_id
WHERE rc.receipt_id IS NULL 
  AND o.lifecycle_status IN ('DELIVERED', 'PARTIALLY_DELIVERED');

CREATE OR REPLACE VIEW view_store_disputes AS
SELECT 
  disp.dispute_id,
  disp.order_id,
  disp.item_id,
  disp.dispute_type,
  disp.units_affected,
  disp.store_notes,
  disp.evidence_photo_urls,
  disp.resolution_status,
  disp.resolution_notes,
  disp.resolved_at,
  disp.created_at,
  u.full_name AS reported_by_name
FROM disputes disp
JOIN users u ON disp.reported_by_id = u.user_id;

-- ============================================================================
-- 2. DISPATCHER VIEWS
-- ============================================================================

CREATE OR REPLACE VIEW view_dispatcher_order_queue AS
SELECT 
  o.order_id,
  o.outlet_id,
  outl.brand_id,
  outl.district_id,
  outl.depot_id,
  outl.dock_type,
  outl.parking_constraint,
  outl.window_open_time,
  outl.window_close_time,
  outl.mall_window_open,
  outl.mall_window_close,
  o.order_date,
  o.temp_requirement,
  o.order_units,
  o.order_weight_kg,
  o.order_volume_m3,
  o.priority_score,
  o.consecutive_skips,
  o.deferred_yesterday,
  o.days_since_last_served,
  o.lifecycle_status
FROM orders o
JOIN outlets outl ON o.outlet_id = outl.outlet_id
WHERE o.lifecycle_status IN ('CONFIRMED', 'DEFERRED');

CREATE OR REPLACE VIEW view_dispatcher_cutoff_summary AS
SELECT 
  o.order_date,
  outl.depot_id,
  outl.brand_id,
  COUNT(o.order_id) AS total_orders,
  COUNT(CASE WHEN o.is_after_cutoff = FALSE THEN 1 END) AS eligible_for_run,
  COUNT(CASE WHEN o.is_after_cutoff = TRUE THEN 1 END) AS pushed_to_next_run,
  COALESCE(SUM(CASE WHEN o.is_after_cutoff = FALSE THEN o.order_weight_kg END), 0) AS eligible_weight_kg,
  COALESCE(SUM(CASE WHEN o.is_after_cutoff = FALSE THEN o.order_volume_m3 END), 0) AS eligible_volume_m3
FROM orders o
JOIN outlets outl ON o.outlet_id = outl.outlet_id
GROUP BY o.order_date, outl.depot_id, outl.brand_id;

CREATE OR REPLACE VIEW view_dispatcher_available_fleet AS
SELECT 
  v.vehicle_id,
  v.depot_id,
  v.type,
  v.temp,
  v.weight_cap_kg,
  v.volume_cap_m3,
  v.fuel_type,
  v.km_per_l,
  v.weekly_fuel_quota_l,
  v.status,
  v.assigned_driver_id,
  u.full_name AS driver_name,
  u.phone_number AS driver_phone,
  COALESCE(fl.used_this_week_liters, 0) AS used_fuel_liters,
  v.weekly_fuel_quota_l - COALESCE(fl.used_this_week_liters, 0) AS remaining_fuel_quota_liters
FROM vehicles v
LEFT JOIN users u ON v.assigned_driver_id = u.user_id
LEFT JOIN (
  SELECT 
    vehicle_id,
    SUM(fuel_consumed_liters) AS used_this_week_liters
  FROM vehicle_fuel_ledgers
  WHERE iso_year = EXTRACT(ISODOW FROM CURRENT_DATE) 
    AND iso_week = EXTRACT(WEEK FROM CURRENT_DATE)
  GROUP BY vehicle_id
) fl ON v.vehicle_id = fl.vehicle_id
WHERE v.status = 'available';

CREATE OR REPLACE VIEW view_dispatcher_plan_summary AS
SELECT 
  p.plan_id,
  p.plan_date,
  p.depot_id,
  p.status AS plan_status,
  t.trip_id,
  t.trip_number,
  t.vehicle_id,
  v.type AS vehicle_type,
  v.temp AS vehicle_temp,
  t.brand_id,
  t.district_id,
  u.full_name AS driver_name,
  t.status AS trip_status,
  t.total_orders_count,
  t.total_weight_kg,
  v.weight_cap_kg,
  ROUND((t.total_weight_kg / v.weight_cap_kg) * 100, 1) AS weight_utilization_pct,
  t.total_volume_m3,
  v.volume_cap_m3,
  ROUND((t.total_volume_m3 / v.volume_cap_m3) * 100, 1) AS volume_utilization_pct,
  t.total_trip_minutes,
  t.max_time_budget_min,
  ROUND((t.total_trip_minutes / t.max_time_budget_min) * 100, 1) AS time_budget_utilization_pct,
  t.estimated_fuel_liters
FROM allocation_plans p
JOIN trips t ON p.plan_id = t.plan_id
JOIN vehicles v ON t.vehicle_id = v.vehicle_id
JOIN users u ON t.driver_id = u.user_id;

CREATE OR REPLACE VIEW view_dispatcher_control_tower AS
SELECT 
  t.trip_id,
  t.depot_id,
  t.brand_id,
  t.district_id,
  t.vehicle_id,
  u.full_name AS driver_name,
  t.status AS trip_status,
  t.total_orders_count,
  COUNT(CASE WHEN ts.status = 'PENDING' THEN 1 END) AS pending_stops,
  COUNT(CASE WHEN ts.status = 'ARRIVED' THEN 1 END) AS arrived_stops,
  COUNT(CASE WHEN ts.status = 'DELIVERED' THEN 1 END) AS completed_stops,
  COUNT(CASE WHEN ts.status = 'FAILED' THEN 1 END) AS failed_stops,
  COUNT(CASE WHEN ts.is_late = TRUE THEN 1 END) AS late_stops,
  COALESCE(le.shortfalls_count, 0) AS loading_exceptions_count
FROM trips t
JOIN users u ON t.driver_id = u.user_id
JOIN trip_stops ts ON t.trip_id = ts.trip_id
LEFT JOIN (
  SELECT lm.trip_id, COUNT(lex.exception_id) AS shortfalls_count
  FROM loading_manifests lm
  JOIN loading_exceptions lex ON lm.manifest_id = lex.manifest_id
  WHERE lex.resolution = 'PENDING'
  GROUP BY lm.trip_id
) le ON t.trip_id = le.trip_id
GROUP BY t.trip_id, t.depot_id, t.brand_id, t.district_id, t.vehicle_id, u.full_name, t.status, t.total_orders_count, le.shortfalls_count;

CREATE OR REPLACE VIEW view_dispatcher_stop_predictions AS
SELECT 
  ts.stop_id,
  ts.trip_id,
  ts.order_id,
  ts.outlet_id,
  outl.brand_id,
  outl.district_id,
  outl.dock_type,
  outl.window_open_time,
  outl.window_close_time,
  ts.stop_sequence,
  ts.planned_arrival_time,
  COALESCE(dp.pred_service_min, ts.predicted_service_min) AS pred_service_min,
  COALESCE(dp.pred_late_prob, ts.predicted_late_prob) AS pred_late_prob,
  ts.actual_arrival_time,
  ts.actual_service_min,
  ts.is_late
FROM trip_stops ts
JOIN outlets outl ON ts.outlet_id = outl.outlet_id
LEFT JOIN delivery_predictions dp ON ts.order_id = dp.delivery_id;

-- ============================================================================
-- 3. LOADER VIEWS
-- ============================================================================

CREATE OR REPLACE VIEW view_loader_active_trips AS
SELECT 
  t.trip_id,
  t.depot_id,
  t.vehicle_id,
  v.type AS vehicle_type,
  v.temp AS vehicle_temp,
  t.trip_number,
  t.brand_id,
  t.district_id,
  t.total_orders_count,
  t.total_weight_kg,
  t.total_volume_m3,
  t.planned_departure_time,
  lm.manifest_id,
  COALESCE(lm.status, 'QUEUED') AS manifest_status,
  lm.started_at,
  lm.completed_at
FROM trips t
JOIN vehicles v ON t.vehicle_id = v.vehicle_id
LEFT JOIN loading_manifests lm ON t.trip_id = lm.trip_id
WHERE t.status IN ('PLANNED', 'LOADING');

CREATE OR REPLACE VIEW view_loader_stop_manifest AS
SELECT 
  ts.trip_id,
  ts.load_sequence,
  ts.stop_sequence,
  ts.stop_id,
  ts.order_id,
  ts.outlet_id,
  outl.dock_type,
  outl.parking_constraint,
  o.temp_requirement,
  o.order_units,
  o.order_weight_kg,
  o.order_volume_m3,
  o.lifecycle_status,
  COALESCE(lex.shortfall_status, 'OK') AS loading_check_status
FROM trip_stops ts
JOIN orders o ON ts.order_id = o.order_id
JOIN outlets outl ON ts.outlet_id = outl.outlet_id
LEFT JOIN (
  SELECT order_id, 'SHORTFALL_FLAGGED' AS shortfall_status
  FROM loading_exceptions
  WHERE resolution = 'PENDING'
) lex ON ts.order_id = lex.order_id
ORDER BY ts.trip_id, ts.load_sequence ASC;

CREATE OR REPLACE VIEW view_loader_exceptions_summary AS
SELECT 
  lex.exception_id,
  lm.trip_id,
  t.vehicle_id,
  lex.order_id,
  lex.item_id,
  oi.product_name,
  oi.sku_code,
  lex.exception_type,
  lex.quantity_short,
  lex.resolution,
  lex.created_at,
  u_loader.full_name AS loader_name,
  u_disp.full_name AS resolved_by_name
FROM loading_exceptions lex
JOIN loading_manifests lm ON lex.manifest_id = lm.manifest_id
JOIN trips t ON lm.trip_id = t.trip_id
JOIN users u_loader ON lex.flagged_by_id = u_loader.user_id
LEFT JOIN order_items oi ON lex.item_id = oi.item_id
LEFT JOIN users u_disp ON lex.resolved_by_id = u_disp.user_id;

-- ============================================================================
-- 4. DRIVER VIEWS
-- ============================================================================

CREATE OR REPLACE VIEW view_driver_active_run_sheet AS
SELECT 
  t.driver_id,
  u.full_name AS driver_name,
  t.trip_id,
  t.trip_number,
  t.depot_id,
  d.name AS depot_name,
  t.vehicle_id,
  v.type AS vehicle_type,
  v.temp AS vehicle_temp,
  t.brand_id,
  t.district_id,
  t.total_orders_count,
  t.total_weight_kg,
  t.total_volume_m3,
  t.planned_departure_time,
  t.planned_return_time,
  t.status AS trip_status
FROM trips t
JOIN users u ON t.driver_id = u.user_id
JOIN depots d ON t.depot_id = d.depot_id
JOIN vehicles v ON t.vehicle_id = v.vehicle_id
WHERE t.status IN ('PLANNED', 'LOADING', 'IN_TRANSIT');

CREATE OR REPLACE VIEW view_driver_stops AS
SELECT 
  ts.trip_id,
  ts.stop_id,
  ts.stop_sequence,
  ts.order_id,
  ts.outlet_id,
  outl.brand_id,
  outl.district_id,
  outl.dock_type,
  outl.parking_constraint,
  outl.window_open_time,
  outl.window_close_time,
  outl.mall_window_open,
  outl.mall_window_close,
  outl.contact_name,
  outl.contact_phone,
  o.temp_requirement,
  o.order_units,
  o.order_weight_kg,
  o.order_volume_m3,
  ts.planned_arrival_time,
  ts.actual_arrival_time,
  ts.actual_depart_time,
  ts.status AS stop_status,
  pod.pod_id,
  pod.delivered_at
FROM trip_stops ts
JOIN outlets outl ON ts.outlet_id = outl.outlet_id
JOIN orders o ON ts.order_id = o.order_id
LEFT JOIN proof_of_deliveries pod ON ts.stop_id = pod.stop_id
ORDER BY ts.trip_id, ts.stop_sequence ASC;

CREATE OR REPLACE VIEW view_driver_current_stop AS
SELECT DISTINCT ON (ts.trip_id)
  ts.trip_id,
  ts.stop_id,
  ts.stop_sequence,
  ts.order_id,
  ts.outlet_id,
  outl.brand_id,
  outl.dock_type,
  outl.parking_constraint,
  outl.window_open_time,
  outl.window_close_time,
  outl.contact_name,
  outl.contact_phone,
  ts.planned_arrival_time,
  ts.status AS stop_status
FROM trip_stops ts
JOIN outlets outl ON ts.outlet_id = outl.outlet_id
WHERE ts.status IN ('PENDING', 'ARRIVED')
ORDER BY ts.trip_id, ts.stop_sequence ASC;

-- ============================================================================
-- 5. FEASIBILITY & ENGINE VALIDATION VIEWS
-- ============================================================================

CREATE OR REPLACE VIEW view_plan_feasibility_check AS
SELECT 
  t.trip_id,
  t.plan_id,
  t.vehicle_id,
  t.trip_number,
  t.brand_id,
  t.district_id,
  COUNT(DISTINCT outl.brand_id) > 1 AS violates_brand_homogeneity,
  COUNT(DISTINCT outl.district_id) > 1 AS violates_district_homogeneity,
  BOOL_OR(o.temp_requirement = 'chilled' AND v.temp != 'reefer') AS violates_refrigeration,
  BOOL_OR(outl.parking_constraint = 'van_only' AND v.type != 'van') AS violates_van_only_access,
  BOOL_OR(v.depot_id != t.depot_id OR outl.depot_id != t.depot_id) AS violates_home_depot,
  (t.total_weight_kg > v.weight_cap_kg) AS violates_weight_cap,
  (t.total_volume_m3 > v.volume_cap_m3) AS violates_volume_cap,
  (t.total_trip_minutes > t.max_time_budget_min) AS violates_time_budget
FROM trips t
JOIN vehicles v ON t.vehicle_id = v.vehicle_id
JOIN trip_stops ts ON t.trip_id = ts.trip_id
JOIN orders o ON ts.order_id = o.order_id
JOIN outlets outl ON ts.outlet_id = outl.outlet_id
GROUP BY t.trip_id, t.plan_id, t.vehicle_id, t.trip_number, t.brand_id, t.district_id, v.weight_cap_kg, v.volume_cap_m3, t.total_weight_kg, t.total_volume_m3, t.total_trip_minutes, t.max_time_budget_min;

CREATE OR REPLACE VIEW view_vehicle_fuel_tracking AS
SELECT 
  v.vehicle_id,
  v.depot_id,
  v.fuel_type,
  v.weekly_fuel_quota_l,
  COALESCE(SUM(fl.fuel_consumed_liters), 0) AS total_consumed_this_week_liters,
  v.weekly_fuel_quota_l - COALESCE(SUM(fl.fuel_consumed_liters), 0) AS remaining_quota_liters,
  ROUND((COALESCE(SUM(fl.fuel_consumed_liters), 0) / v.weekly_fuel_quota_l) * 100, 1) AS quota_used_pct
FROM vehicles v
LEFT JOIN vehicle_fuel_ledgers fl 
  ON v.vehicle_id = fl.vehicle_id 
  AND fl.iso_year = EXTRACT(ISODOW FROM CURRENT_DATE) 
  AND fl.iso_week = EXTRACT(WEEK FROM CURRENT_DATE)
GROUP BY v.vehicle_id, v.depot_id, v.fuel_type, v.weekly_fuel_quota_l;
