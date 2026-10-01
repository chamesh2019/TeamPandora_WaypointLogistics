export type BrandType = 'FRESH' | 'STYLE' | 'TECH';
export type DepotId = 'PELIYAGODA' | 'KANDY';
export type DockType = 'rear_dock' | 'street' | 'mall_bay';
export type ParkingConstraint = 'normal' | 'van_only' | 'mall_dock';
export type VehicleType = 'truck' | 'van';
export type TempType = 'reefer' | 'ambient';

export function mapBrand(brand: string): BrandType {
  const normalized = brand?.trim().toUpperCase();
  if (normalized === 'FRESH') return 'FRESH';
  if (normalized === 'STYLE') return 'STYLE';
  if (normalized === 'TECH') return 'TECH';
  throw new Error(`Unknown brand: ${brand}`);
}

export function mapDepot(depot: string): DepotId {
  const normalized = depot?.trim().toUpperCase();
  if (normalized === 'PELIYAGODA') return 'PELIYAGODA';
  if (normalized === 'KANDY') return 'KANDY';
  throw new Error(`Unknown depot: ${depot}`);
}

export function formatTime(timeStr?: string): string | null {
  if (!timeStr || !timeStr.trim()) return null;
  const trimmed = timeStr.trim();
  if (trimmed.length === 5 && trimmed.includes(':')) {
    return `${trimmed}:00`;
  }
  return trimmed;
}

export function parseMallWindow(windowStr?: string): { open: string | null; close: string | null } {
  if (!windowStr || !windowStr.trim()) {
    return { open: null, close: null };
  }
  const parts = windowStr.trim().split('-');
  if (parts.length === 2) {
    return {
      open: formatTime(parts[0]),
      close: formatTime(parts[1]),
    };
  }
  return { open: null, close: null };
}

export function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim().replace(/^["']|["']$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim().replace(/^["']|["']$/g, ''));
  return values;
}

export function parseCsv(csvContent: string): Record<string, string>[] {
  const lines = csvContent
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  if (lines.length === 0) return [];

  const headers = parseCsvLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] ?? '';
    }
    rows.push(row);
  }

  return rows;
}

export interface OutletRecord {
  outlet_id: string;
  brand_id: BrandType;
  district_id: string;
  depot_id: DepotId;
  dock_type: DockType;
  parking_constraint: ParkingConstraint;
  mall_window_open: string | null;
  mall_window_close: string | null;
  window_open_time: string;
  window_close_time: string;
  contact_name: string | null;
  contact_phone: string | null;
}

export function parseOutlets(csvContent: string): OutletRecord[] {
  const rows = parseCsv(csvContent);
  return rows.map(r => {
    const mallWindow = parseMallWindow(r.mall_window);
    return {
      outlet_id: r.outlet_id,
      brand_id: mapBrand(r.brand),
      district_id: r.district,
      depot_id: mapDepot(r.depot),
      dock_type: r.dock_type as DockType,
      parking_constraint: r.parking_constraint as ParkingConstraint,
      mall_window_open: mallWindow.open,
      mall_window_close: mallWindow.close,
      window_open_time: formatTime(r.window_open_time) || '05:00:00',
      window_close_time: formatTime(r.window_close_time) || '08:00:00',
      contact_name: r.contact_name?.trim() || null,
      contact_phone: r.contact_phone?.trim() || null,
    };
  });
}

export interface VehicleRecord {
  vehicle_id: string;
  type: VehicleType;
  temp: TempType;
  weight_cap_kg: number;
  volume_cap_m3: number;
  fuel_type: string;
  km_per_l: number;
  weekly_fuel_quota_l: number;
  depot_id: DepotId;
  status: 'available' | 'in_workshop';
}

export function parseVehicles(csvContent: string): VehicleRecord[] {
  const rows = parseCsv(csvContent);
  return rows.map(r => ({
    vehicle_id: r.vehicle_id,
    type: r.type as VehicleType,
    temp: r.temp as TempType,
    weight_cap_kg: parseFloat(r.weight_cap_kg),
    volume_cap_m3: parseFloat(r.volume_cap_m3),
    fuel_type: r.fuel_type,
    km_per_l: parseFloat(r.km_per_l),
    weekly_fuel_quota_l: parseFloat(r.weekly_fuel_quota_l),
    depot_id: mapDepot(r.depot),
    status: 'available' as const,
  }));
}

export interface DistrictTravelRecord {
  district_id: string;
  depot_id: DepotId;
  road_class: string;
  free_flow_kmh: number;
  depot_to_district_km: number;
  depot_to_district_freeflow_min: number;
  inter_stop_km: number;
  inter_stop_freeflow_min: number;
}

export function parseDistrictTravel(csvContent: string): DistrictTravelRecord[] {
  const rows = parseCsv(csvContent);
  return rows.map(r => ({
    district_id: r.district,
    depot_id: mapDepot(r.depot),
    road_class: r.road_class,
    free_flow_kmh: parseFloat(r.free_flow_kmh),
    depot_to_district_km: parseFloat(r.depot_to_district_km),
    depot_to_district_freeflow_min: parseFloat(r.depot_to_district_freeflow_min),
    inter_stop_km: parseFloat(r.inter_stop_km),
    inter_stop_freeflow_min: parseFloat(r.inter_stop_freeflow_min),
  }));
}

export interface ServiceAllowanceRecord {
  brand_id: BrandType;
  dock_type: DockType;
  service_allowance_min: number;
}

export function parseServiceAllowances(csvContent: string): ServiceAllowanceRecord[] {
  const rows = parseCsv(csvContent);
  return rows.map(r => ({
    brand_id: mapBrand(r.brand),
    dock_type: r.dock_type as DockType,
    service_allowance_min: parseFloat(r.service_allowance_min),
  }));
}

export interface CalendarRecord {
  calendar_date: string;
  dow: number;
  dow_name: string;
  is_weekend: boolean;
  iso_year: number;
  iso_week: number;
  is_payday: boolean;
  festival: string | null;
  festival_ramp: number;
  is_holiday: boolean;
  monsoon: boolean;
  is_operating: boolean;
}

export function parseCalendar(csvContent: string): CalendarRecord[] {
  const rows = parseCsv(csvContent);
  return rows.map(r => ({
    calendar_date: r.date,
    dow: parseInt(r.dow, 10),
    dow_name: r.dow_name,
    is_weekend: r.is_weekend === '1' || r.is_weekend?.toLowerCase() === 'true',
    iso_year: parseInt(r.iso_year, 10),
    iso_week: parseInt(r.iso_week, 10),
    is_payday: r.is_payday === '1' || r.is_payday?.toLowerCase() === 'true',
    festival: r.festival ? r.festival : null,
    festival_ramp: parseFloat(r.festival_ramp || '0'),
    is_holiday: r.is_holiday === '1' || r.is_holiday?.toLowerCase() === 'true',
    monsoon: r.monsoon === '1' || r.monsoon?.toLowerCase() === 'true',
    is_operating: r.is_operating === '1' || r.is_operating?.toLowerCase() === 'true',
  }));
}
