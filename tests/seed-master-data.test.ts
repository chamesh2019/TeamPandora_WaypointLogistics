import { describe, it, expect } from 'vitest';
import { readAndParseCsvData } from '../scripts/seed-master-data';

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
});
