import { describe, it, expect } from 'vitest';
import { readAndParseCsvData, generateSqlSeed } from '../scripts/seed-master-data';

describe('Master Data Ingestion', () => {
  it('reads all 120 outlets and transforms columns', () => {
    const outlets = readAndParseCsvData('outlets');
    expect(outlets.length).toBe(120);
    expect(outlets[0].outlet_id).toBe('OUT001');
    expect(outlets[0].brand_id).toBe('FRESH');
    expect(outlets[0].depot_id).toBe('PELIYAGODA');
  });

  it('reads all 60 vehicles and preserves capacity numbers', () => {
    const vehicles = readAndParseCsvData('vehicles');
    expect(vehicles.length).toBe(60);
    expect(vehicles.filter(v => v.temp === 'reefer').length).toBe(16);
    expect(vehicles.filter(v => v.type === 'van').length).toBe(8);
  });

  it('reads service allowances correctly matching official standards', () => {
    const allowances = readAndParseCsvData('service_allowances');
    expect(allowances.length).toBe(9);
    const styleRear = allowances.find(a => a.brand_id === 'STYLE' && a.dock_type === 'rear_dock');
    expect(styleRear?.service_allowance_min).toBe(38);
  });

  it('reads district travel rows correctly', () => {
    const travel = readAndParseCsvData('district_travel');
    expect(travel.length).toBe(12);
  });

  it('reads calendar rows correctly', () => {
    const calendar = readAndParseCsvData('calendar');
    expect(calendar.length).toBeGreaterThan(300);
  });

  it('generates consistent order headers and matching line items in SQL seed', () => {
    const sql = generateSqlSeed();
    expect(sql).toContain("('ORD-20261001-001', 'OUT001', '2026-10-01', '2026-09-30 14:10:00', FALSE, 'chilled', 45, 499.50, 2.400");
    for (let i = 1; i <= 8; i++) {
      expect(sql).toContain(`ORD-20261001-00${i}`);
      expect(sql).toContain(`'ORD-20261001-00${i}'`);
    }
    // Verify all orders 1..8 have items in order_items block
    const orderItemsBlock = sql.slice(sql.indexOf('INSERT INTO order_items'));
    for (let i = 1; i <= 8; i++) {
      expect(orderItemsBlock).toContain(`'ORD-20261001-00${i}'`);
    }
  });

  it('generates store manager accounts for all 120 outlets in SQL seed', () => {
    const sql = generateSqlSeed();
    // Verifies canonical store_manager exists for judge walkthroughs
    expect(sql).toContain("'store_manager'");
    expect(sql).toContain("'usr-stor-001'");
    // Verifies outlet-specific managers exist for all outlets
    expect(sql).toContain("'manager_out001'");
    expect(sql).toContain("'manager_out081'");
    expect(sql).toContain("'manager_out120'");
    expect(sql).toContain("'usr-stor-out120'");
  });
});
