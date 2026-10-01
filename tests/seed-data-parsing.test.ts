import { describe, it, expect } from 'vitest';
import {
  parseMallWindow,
  mapBrand,
  mapDepot,
  parseCsv,
  parseOutlets,
  parseVehicles,
  parseDistrictTravel,
  parseServiceAllowances,
  parseCalendar,
} from '../scripts/seed-utils';

describe('Seed Data Mapping Utils', () => {
  it('correctly maps brand strings to DB enum values', () => {
    expect(mapBrand('Fresh')).toBe('FRESH');
    expect(mapBrand('Style')).toBe('STYLE');
    expect(mapBrand('Tech')).toBe('TECH');
  });

  it('correctly maps depot strings to DB IDs', () => {
    expect(mapDepot('Peliyagoda')).toBe('PELIYAGODA');
    expect(mapDepot('Kandy')).toBe('KANDY');
  });

  it('parses mall_window range string into open and close times', () => {
    expect(parseMallWindow('09:00-11:00')).toEqual({ open: '09:00:00', close: '11:00:00' });
    expect(parseMallWindow('')).toEqual({ open: null, close: null });
    expect(parseMallWindow(undefined)).toEqual({ open: null, close: null });
  });

  it('parses raw CSV text into objects', () => {
    const csv = 'col1,col2\nval1,val2\nval3,val4';
    const rows = parseCsv(csv);
    expect(rows).toEqual([
      { col1: 'val1', col2: 'val2' },
      { col1: 'val3', col2: 'val4' },
    ]);
  });

  it('parses outlets CSV records into database row formats', () => {
    const csv = 'outlet_id,brand,district,depot,dock_type,parking_constraint,mall_window,window_open_time,window_close_time\nOUT001,Fresh,Colombo,Peliyagoda,street,van_only,,05:00,07:30\nOUT040,Style,Gampaha,Peliyagoda,mall_bay,mall_dock,09:00-11:00,09:00,11:00';
    const outlets = parseOutlets(csv);
    expect(outlets.length).toBe(2);
    expect(outlets[0]).toEqual({
      outlet_id: 'OUT001',
      brand_id: 'FRESH',
      district_id: 'Colombo',
      depot_id: 'PELIYAGODA',
      dock_type: 'street',
      parking_constraint: 'van_only',
      mall_window_open: null,
      mall_window_close: null,
      window_open_time: '05:00:00',
      window_close_time: '07:30:00',
    });
    expect(outlets[1].mall_window_open).toBe('09:00:00');
    expect(outlets[1].mall_window_close).toBe('11:00:00');
  });

  it('parses vehicles CSV records into database row formats', () => {
    const csv = 'vehicle_id,type,temp,weight_cap_kg,volume_cap_m3,fuel_type,km_per_l,weekly_fuel_quota_l,depot\nVEH001,truck,reefer,5510,26.4,diesel,4.7,340,Peliyagoda';
    const vehicles = parseVehicles(csv);
    expect(vehicles.length).toBe(1);
    expect(vehicles[0]).toEqual({
      vehicle_id: 'VEH001',
      type: 'truck',
      temp: 'reefer',
      weight_cap_kg: 5510,
      volume_cap_m3: 26.4,
      fuel_type: 'diesel',
      km_per_l: 4.7,
      weekly_fuel_quota_l: 340,
      depot_id: 'PELIYAGODA',
      status: 'available',
    });
  });

  it('parses district travel CSV records', () => {
    const csv = 'district,depot,road_class,free_flow_kmh,depot_to_district_km,depot_to_district_freeflow_min,inter_stop_km,inter_stop_freeflow_min\nColombo,Peliyagoda,urban,30.0,12,24,4.0,8';
    const travel = parseDistrictTravel(csv);
    expect(travel.length).toBe(1);
    expect(travel[0]).toEqual({
      district_id: 'Colombo',
      depot_id: 'PELIYAGODA',
      road_class: 'urban',
      free_flow_kmh: 30.0,
      depot_to_district_km: 12,
      depot_to_district_freeflow_min: 24,
      inter_stop_km: 4.0,
      inter_stop_freeflow_min: 8,
    });
  });

  it('parses service allowances CSV records', () => {
    const csv = 'brand,dock_type,service_allowance_min\nFresh,rear_dock,15\nStyle,rear_dock,38';
    const allowances = parseServiceAllowances(csv);
    expect(allowances.length).toBe(2);
    expect(allowances[0]).toEqual({
      brand_id: 'FRESH',
      dock_type: 'rear_dock',
      service_allowance_min: 15,
    });
    expect(allowances[1]).toEqual({
      brand_id: 'STYLE',
      dock_type: 'rear_dock',
      service_allowance_min: 38,
    });
  });

  it('parses calendar CSV records', () => {
    const csv = 'date,dow,dow_name,is_weekend,iso_year,iso_week,is_payday,festival,festival_ramp,is_holiday,monsoon,is_operating\n2024-01-01,0,Mon,0,2024,1,0,,0.0,0,0,1';
    const calendar = parseCalendar(csv);
    expect(calendar.length).toBe(1);
    expect(calendar[0]).toEqual({
      calendar_date: '2024-01-01',
      dow: 0,
      dow_name: 'Mon',
      is_weekend: false,
      iso_year: 2024,
      iso_week: 1,
      is_payday: false,
      festival: null,
      festival_ramp: 0.0,
      is_holiday: false,
      monsoon: false,
      is_operating: true,
    });
  });
});
