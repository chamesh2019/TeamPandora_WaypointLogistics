import fs from 'fs';
import path from 'path';
import { pool } from '../lib/db';
import {
  parseOutlets,
  parseVehicles,
  parseDistrictTravel,
  parseServiceAllowances,
  parseCalendar,
  OutletRecord,
  VehicleRecord,
  DistrictTravelRecord,
  ServiceAllowanceRecord,
  CalendarRecord,
} from './seed-utils';

export function getCsvPath(filename: string): string {
  const candidates = [
    path.resolve(process.cwd(), 'docs/data/General Data', filename),
    path.resolve(process.cwd(), '../docs/data/General Data', filename),
    path.resolve(__dirname, '../../docs/data/General Data', filename),
    path.resolve(__dirname, '../../../docs/data/General Data', filename),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  throw new Error(`Could not find CSV file: ${filename}`);
}

export function readAndParseCsvData(entity: 'outlets'): OutletRecord[];
export function readAndParseCsvData(entity: 'vehicles'): VehicleRecord[];
export function readAndParseCsvData(entity: 'service_allowances'): ServiceAllowanceRecord[];
export function readAndParseCsvData(entity: 'district_travel'): DistrictTravelRecord[];
export function readAndParseCsvData(entity: 'calendar'): CalendarRecord[];
export function readAndParseCsvData(entity: string): any[] {
  switch (entity) {
    case 'outlets': {
      const content = fs.readFileSync(getCsvPath('outlets.csv'), 'utf8');
      return parseOutlets(content);
    }
    case 'vehicles': {
      const content = fs.readFileSync(getCsvPath('vehicles.csv'), 'utf8');
      return parseVehicles(content);
    }
    case 'service_allowances': {
      const content = fs.readFileSync(getCsvPath('service_allowance.csv'), 'utf8');
      return parseServiceAllowances(content);
    }
    case 'district_travel': {
      const content = fs.readFileSync(getCsvPath('district_travel.csv'), 'utf8');
      return parseDistrictTravel(content);
    }
    case 'calendar': {
      const content = fs.readFileSync(getCsvPath('calendar.csv'), 'utf8');
      return parseCalendar(content);
    }
    default:
      throw new Error(`Unknown entity for CSV parsing: ${entity}`);
  }
}

export async function seedMasterData(): Promise<{
  outlets: number;
  vehicles: number;
  districts: number;
  calendar: number;
  allowances: number;
}> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Seed Depots
    await client.query(`
      INSERT INTO depots (depot_id, name, district, latitude, longitude, is_active)
      VALUES
        ('PELIYAGODA', 'Peliyagoda Distribution Center', 'Gampaha', 6.965400, 79.897800, TRUE),
        ('KANDY', 'Kandy Regional Hub', 'Kandy', 7.290600, 80.633700, TRUE)
      ON CONFLICT (depot_id) DO UPDATE SET
        name = EXCLUDED.name,
        district = EXCLUDED.district,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        is_active = EXCLUDED.is_active;
    `);

    // 2. Seed Brands
    await client.query(`
      INSERT INTO brands (brand_id, name, outlets_count, goods_description, delivery_schedule, has_chilled_demand)
      VALUES
        ('FRESH', 'Waypoint Fresh', 80, 'Groceries, chilled and frozen goods, dairy, produce', 'Daily; before stores open at 8 AM', TRUE),
        ('STYLE', 'Waypoint Style', 25, 'Hanging garments and cartons; high volume ratio', 'Weekly, with seasonal peaks', FALSE),
        ('TECH', 'Waypoint Tech', 15, 'Appliances and consumer electronics; heavy and fragile', 'As needed; high-value goods', FALSE)
      ON CONFLICT (brand_id) DO UPDATE SET
        name = EXCLUDED.name,
        outlets_count = EXCLUDED.outlets_count,
        goods_description = EXCLUDED.goods_description,
        delivery_schedule = EXCLUDED.delivery_schedule,
        has_chilled_demand = EXCLUDED.has_chilled_demand;
    `);

    // 3. Seed Districts
    const districtTravels = readAndParseCsvData('district_travel');
    for (const dt of districtTravels) {
      await client.query(
        `
        INSERT INTO districts (district_id, serving_depot_id, road_class)
        VALUES ($1, $2, $3)
        ON CONFLICT (district_id) DO UPDATE SET
          serving_depot_id = EXCLUDED.serving_depot_id,
          road_class = EXCLUDED.road_class;
        `,
        [dt.district_id, dt.depot_id, dt.road_class]
      );
    }

    // 4. Seed Service Allowances
    const allowances = readAndParseCsvData('service_allowances');
    for (const sa of allowances) {
      await client.query(
        `
        INSERT INTO service_allowances (brand_id, dock_type, service_allowance_min)
        VALUES ($1, $2, $3)
        ON CONFLICT (brand_id, dock_type) DO UPDATE SET
          service_allowance_min = EXCLUDED.service_allowance_min;
        `,
        [sa.brand_id, sa.dock_type, sa.service_allowance_min]
      );
    }

    // 5. Seed District Travel Rows
    for (const dt of districtTravels) {
      await client.query(
        `
        INSERT INTO district_travel (
          district_id, depot_id, road_class, free_flow_kmh,
          depot_to_district_km, depot_to_district_freeflow_min,
          inter_stop_km, inter_stop_freeflow_min
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (district_id, depot_id) DO UPDATE SET
          road_class = EXCLUDED.road_class,
          free_flow_kmh = EXCLUDED.free_flow_kmh,
          depot_to_district_km = EXCLUDED.depot_to_district_km,
          depot_to_district_freeflow_min = EXCLUDED.depot_to_district_freeflow_min,
          inter_stop_km = EXCLUDED.inter_stop_km,
          inter_stop_freeflow_min = EXCLUDED.inter_stop_freeflow_min;
        `,
        [
          dt.district_id,
          dt.depot_id,
          dt.road_class,
          dt.free_flow_kmh,
          dt.depot_to_district_km,
          dt.depot_to_district_freeflow_min,
          dt.inter_stop_km,
          dt.inter_stop_freeflow_min,
        ]
      );
    }

    // 6. Seed Outlets (120 outlets)
    const outlets = readAndParseCsvData('outlets');
    for (const o of outlets) {
      await client.query(
        `
        INSERT INTO outlets (
          outlet_id, brand_id, district_id, depot_id,
          dock_type, parking_constraint,
          mall_window_open, mall_window_close,
          window_open_time, window_close_time,
          contact_name, contact_phone
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (outlet_id) DO UPDATE SET
          brand_id = EXCLUDED.brand_id,
          district_id = EXCLUDED.district_id,
          depot_id = EXCLUDED.depot_id,
          dock_type = EXCLUDED.dock_type,
          parking_constraint = EXCLUDED.parking_constraint,
          mall_window_open = EXCLUDED.mall_window_open,
          mall_window_close = EXCLUDED.mall_window_close,
          window_open_time = EXCLUDED.window_open_time,
          window_close_time = EXCLUDED.window_close_time;
        `,
        [
          o.outlet_id,
          o.brand_id,
          o.district_id,
          o.depot_id,
          o.dock_type,
          o.parking_constraint,
          o.mall_window_open,
          o.mall_window_close,
          o.window_open_time,
          o.window_close_time,
          `Manager ${o.outlet_id}`,
          '0770000000',
        ]
      );
    }

    // 7. Seed 4 Role Users (and Better Auth accounts)
    await client.query(`
      INSERT INTO users (user_id, username, password_hash, full_name, role, depot_id, outlet_id, phone_number)
      VALUES
        ('usr-disp-001', 'dispatcher', 'dispatch123', 'Sarath Gunawardena', 'dispatcher', 'PELIYAGODA', NULL, '0714455661'),
        ('usr-load-001', 'loader', 'loader123', 'Sunil Jayasinghe', 'loader', 'PELIYAGODA', NULL, '0714455662'),
        ('usr-driv-001', 'driver', 'driver123', 'Nimal Fernando', 'driver', 'PELIYAGODA', NULL, '0714455663'),
        ('usr-stor-001', 'store_manager', 'store123', 'Anura Silva', 'store_manager', NULL, 'OUT001', '0771234501')
      ON CONFLICT (username) DO UPDATE SET
        user_id = EXCLUDED.user_id,
        password_hash = EXCLUDED.password_hash,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        depot_id = EXCLUDED.depot_id,
        outlet_id = EXCLUDED.outlet_id,
        phone_number = EXCLUDED.phone_number;
    `);

    // Better Auth seed sync
    await client.query(`
      INSERT INTO "user" ("id", "name", "email", "emailVerified", "username", "displayUsername", "role", "depotId", "outletId", "phoneNumber", "createdAt", "updatedAt")
      VALUES
        ('usr-disp-001', 'Sarath Gunawardena', 'dispatcher@waypoint.lk', TRUE, 'dispatcher', 'dispatcher', 'dispatcher', 'PELIYAGODA', NULL, '0714455661', NOW(), NOW()),
        ('usr-load-001', 'Sunil Jayasinghe', 'loader@waypoint.lk', TRUE, 'loader', 'loader', 'loader', 'PELIYAGODA', NULL, '0714455662', NOW(), NOW()),
        ('usr-driv-001', 'Nimal Fernando', 'driver@waypoint.lk', TRUE, 'driver', 'driver', 'driver', 'PELIYAGODA', NULL, '0714455663', NOW(), NOW()),
        ('usr-stor-001', 'Anura Silva', 'store@waypoint.lk', TRUE, 'store_manager', 'store_manager', 'store_manager', NULL, 'OUT001', '0771234501', NOW(), NOW())
      ON CONFLICT ("id") DO UPDATE SET
        "name" = EXCLUDED."name",
        "email" = EXCLUDED."email",
        "username" = EXCLUDED."username",
        "role" = EXCLUDED."role",
        "depotId" = EXCLUDED."depotId",
        "outletId" = EXCLUDED."outletId",
        "updatedAt" = NOW();

      INSERT INTO "account" ("id", "accountId", "providerId", "userId", "password", "createdAt", "updatedAt")
      VALUES
        ('acc-disp-001', 'usr-disp-001', 'credential', 'usr-disp-001', 'a03fe187fd7b90370b05169381b17697:29a9187eb28eb9128cd495cd1844e3ecf33aee584dd670ef81702052ae857a61ea9fd1ea0a6eb806a7e1fb7e2e0b0c40abf5b6e7785291517fb0a9f45ed456bc', NOW(), NOW()),
        ('acc-load-001', 'usr-load-001', 'credential', 'usr-load-001', '7fd66d021ce0d92a9e2571159546f824:6622c449a8cf7e2d35d5ed1766d8c1c2fe3b3f17a417a0c282fa63bcfe3564aaaedc29d74665ab29f7604ca8c8fdfede2255c23130864a577cbbe59b8daef527', NOW(), NOW()),
        ('acc-driv-001', 'usr-driv-001', 'credential', 'usr-driv-001', 'c3e9270c2e79d9ce34585d82a43d149f:dc2c7762ad3623d5a9426d2bdb8654d30a7336235ec6cf9743551a15c4626f19cfd59f95abbc62d2e9855ce44d08c41ba148b18b2cd731ccd80b762dd3b65064', NOW(), NOW()),
        ('acc-stor-001', 'usr-stor-001', 'credential', 'usr-stor-001', '9b24d22625e76d3c39e95a33cc61a3ad:d0c3ca78dda8d9b0faf81339b1c6f56b093d78eddb45a8cea735604157e4ff48438e07a8b8c2b80b9533f849bb2eb629dc377d681c4b61e975b2d564bbe7225f', NOW(), NOW())
      ON CONFLICT ("id") DO UPDATE SET
        "password" = EXCLUDED."password",
        "updatedAt" = NOW();
    `);

    // 8. Seed Vehicles (60 vehicles)
    const vehicles = readAndParseCsvData('vehicles');
    for (const v of vehicles) {
      const assignedDriver = v.vehicle_id === 'VEH001' ? 'usr-driv-001' : null;
      await client.query(
        `
        INSERT INTO vehicles (
          vehicle_id, type, temp, weight_cap_kg, volume_cap_m3,
          fuel_type, km_per_l, weekly_fuel_quota_l, depot_id, status, assigned_driver_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (vehicle_id) DO UPDATE SET
          type = EXCLUDED.type,
          temp = EXCLUDED.temp,
          weight_cap_kg = EXCLUDED.weight_cap_kg,
          volume_cap_m3 = EXCLUDED.volume_cap_m3,
          fuel_type = EXCLUDED.fuel_type,
          km_per_l = EXCLUDED.km_per_l,
          weekly_fuel_quota_l = EXCLUDED.weekly_fuel_quota_l,
          depot_id = EXCLUDED.depot_id,
          status = EXCLUDED.status,
          assigned_driver_id = EXCLUDED.assigned_driver_id;
        `,
        [
          v.vehicle_id,
          v.type,
          v.temp,
          v.weight_cap_kg,
          v.volume_cap_m3,
          v.fuel_type,
          v.km_per_l,
          v.weekly_fuel_quota_l,
          v.depot_id,
          v.status,
          assignedDriver,
        ]
      );
    }

    // 9. Seed Calendar
    const calendar = readAndParseCsvData('calendar');
    // Batch insert calendar for performance
    const batchSize = 100;
    for (let i = 0; i < calendar.length; i += batchSize) {
      const chunk = calendar.slice(i, i + batchSize);
      const values: any[] = [];
      const placeholders: string[] = [];

      chunk.forEach((c, idx) => {
        const offset = idx * 12;
        placeholders.push(
          `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10}, $${offset + 11}, $${offset + 12})`
        );
        values.push(
          c.calendar_date,
          c.dow,
          c.dow_name,
          c.is_weekend,
          c.iso_year,
          c.iso_week,
          c.is_payday,
          c.festival,
          c.festival_ramp,
          c.is_holiday,
          c.monsoon,
          c.is_operating
        );
      });

      await client.query(
        `
        INSERT INTO calendar (
          calendar_date, dow, dow_name, is_weekend, iso_year, iso_week,
          is_payday, festival, festival_ramp, is_holiday, monsoon, is_operating
        )
        VALUES ${placeholders.join(', ')}
        ON CONFLICT (calendar_date) DO UPDATE SET
          dow = EXCLUDED.dow,
          dow_name = EXCLUDED.dow_name,
          is_weekend = EXCLUDED.is_weekend,
          iso_year = EXCLUDED.iso_year,
          iso_week = EXCLUDED.iso_week,
          is_payday = EXCLUDED.is_payday,
          festival = EXCLUDED.festival,
          festival_ramp = EXCLUDED.festival_ramp,
          is_holiday = EXCLUDED.is_holiday,
          monsoon = EXCLUDED.monsoon,
          is_operating = EXCLUDED.is_operating;
        `,
        values
      );
    }

    // 10. Seed Sample Orders and Items
    await client.query(`
      INSERT INTO orders (
        order_id, outlet_id, order_date, created_at, is_after_cutoff,
        temp_requirement, order_units, order_weight_kg, order_volume_m3,
        priority_score, deferred_yesterday, consecutive_skips, days_since_last_served, lifecycle_status
      )
      VALUES
        ('ORD-20261001-001', 'OUT001', '2026-10-01', '2026-09-30 14:10:00', FALSE, 'chilled', 45, 850.00, 4.500, 8.50, FALSE, 0, 1, 'CONFIRMED'),
        ('ORD-20261001-002', 'OUT001', '2026-10-01', '2026-09-30 14:12:00', FALSE, 'ambient', 60, 1100.00, 5.200, 7.50, FALSE, 0, 1, 'CONFIRMED'),
        ('ORD-20261001-003', 'OUT002', '2026-10-01', '2026-09-30 15:00:00', FALSE, 'chilled', 25, 420.00, 2.800, 9.00, TRUE, 1, 2, 'CONFIRMED'),
        ('ORD-20261001-004', 'OUT007', '2026-10-01', '2026-09-30 15:30:00', FALSE, 'chilled', 30, 600.00, 3.200, 7.00, FALSE, 0, 1, 'CONFIRMED'),
        ('ORD-20261001-005', 'OUT003', '2026-10-01', '2026-09-30 13:45:00', FALSE, 'ambient', 70, 1400.00, 6.500, 6.50, FALSE, 0, 1, 'CONFIRMED'),
        ('ORD-20261001-006', 'OUT004', '2026-10-01', '2026-09-30 15:50:00', FALSE, 'ambient', 55, 980.00, 4.800, 6.00, FALSE, 0, 1, 'CONFIRMED'),
        ('ORD-20261001-007', 'OUT081', '2026-10-01', '2026-09-30 11:20:00', FALSE, 'ambient', 120, 950.00, 18.000, 6.00, FALSE, 0, 4, 'CONFIRMED'),
        ('ORD-20261001-008', 'OUT106', '2026-10-01', '2026-09-30 10:15:00', FALSE, 'ambient', 14, 2200.00, 8.500, 5.50, FALSE, 0, 5, 'CONFIRMED')
      ON CONFLICT (order_id) DO UPDATE SET
        outlet_id = EXCLUDED.outlet_id,
        order_date = EXCLUDED.order_date,
        lifecycle_status = EXCLUDED.lifecycle_status;

      INSERT INTO order_items (
        item_id, order_id, sku_code, product_name, quantity_ordered,
        quantity_loaded, quantity_delivered, quantity_received, unit_weight_kg, unit_volume_m3, is_chilled
      )
      VALUES
        ('itm-001', 'ORD-20261001-001', 'SKU-DAIRY-01', 'Fresh Milk 1L Crates (12 pk)', 20, 20, 20, 20, 13.00, 0.070, TRUE),
        ('itm-002', 'ORD-20261001-001', 'SKU-DAIRY-02', 'Farm Butter 500g Box (24 pk)', 15, 15, 15, 15, 12.50, 0.050, TRUE),
        ('itm-003', 'ORD-20261001-001', 'SKU-MEAT-01', 'Chicken Breast Cold Pack 5kg', 10, 10, 10, 10, 5.20, 0.025, TRUE)
      ON CONFLICT (item_id) DO UPDATE SET
        quantity_ordered = EXCLUDED.quantity_ordered,
        quantity_loaded = EXCLUDED.quantity_loaded,
        quantity_delivered = EXCLUDED.quantity_delivered,
        quantity_received = EXCLUDED.quantity_received;
    `);

    await client.query('COMMIT');

    return {
      outlets: outlets.length,
      vehicles: vehicles.length,
      districts: districtTravels.length,
      calendar: calendar.length,
      allowances: allowances.length,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

if (process.argv[1] && process.argv[1].endsWith('seed-master-data.ts')) {
  seedMasterData()
    .then(counts => {
      console.log('✓ Seeded 2 depots');
      console.log('✓ Seeded 3 brands');
      console.log(`✓ Seeded ${counts.districts} districts`);
      console.log(`✓ Seeded ${counts.allowances} service allowances`);
      console.log(`✓ Seeded ${counts.districts} district travel rows`);
      console.log(`✓ Seeded ${counts.outlets} outlets`);
      console.log(`✓ Seeded ${counts.vehicles} vehicles`);
      console.log('✓ Seeded calendar & 4 role user accounts');
      console.log('Master data seeding completed successfully!');
      process.exit(0);
    })
    .catch(err => {
      console.error('Master data seeding failed:', err);
      process.exit(1);
    });
}
