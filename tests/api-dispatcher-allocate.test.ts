import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as allocateRoute } from '../app/api/dispatcher/allocate/route';
import { POST as publishRoute } from '../app/api/dispatcher/plans/publish/route';
import * as guard from '../lib/api/guard';
import { apiError } from '../lib/api/response';

describe('POST /api/dispatcher/allocate', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(guard, 'requireDispatcher').mockResolvedValue({
      userId: 'usr-disp-001',
      username: 'dispatcher',
      role: 'dispatcher',
      depotId: 'PELIYAGODA',
    });
  });

  it('rejects unauthenticated requests with 401', async () => {
    vi.spyOn(guard, 'requireDispatcher').mockResolvedValueOnce(
      apiError('UNAUTHORIZED', 'Unauthorized: Authentication required', 401)
    );
    const req = new Request('http://localhost:3000/api/dispatcher/allocate', {
      method: 'POST',
      body: JSON.stringify({ plan_date: '2026-10-01' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await allocateRoute(req);
    expect(res.status).toBe(401);
  });

  it('returns proposed trips and deferrals for the requested date', async () => {
    const req = new Request('http://localhost:3000/api/dispatcher/allocate', {
      method: 'POST',
      body: JSON.stringify({ plan_date: '2026-10-01', depot_id: 'PELIYAGODA' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await allocateRoute(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.trips)).toBe(true);
    expect(Array.isArray(body.deferred)).toBe(true);
    expect(body.validation.isValid).toBe(true);
  });

  it('rejects request with missing plan_date', async () => {
    const req = new Request('http://localhost:3000/api/dispatcher/allocate', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await allocateRoute(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
  });
});

describe('POST /api/dispatcher/plans/publish', () => {
  it('rejects unauthenticated requests with 401', async () => {
    vi.spyOn(guard, 'requireDispatcher').mockResolvedValueOnce(
      apiError('UNAUTHORIZED', 'Unauthorized: Authentication required', 401)
    );
    const req = new Request('http://localhost:3000/api/dispatcher/plans/publish', {
      method: 'POST',
      body: JSON.stringify({ plan_id: 'PLAN-TEST', plan_date: '2026-10-01' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await publishRoute(req);
    expect(res.status).toBe(401);
  });

  it('publishes an allocation plan successfully', async () => {
    const req = new Request('http://localhost:3000/api/dispatcher/plans/publish', {
      method: 'POST',
      body: JSON.stringify({
        plan_id: 'PLAN-20261001-TEST',
        plan_date: '2026-10-01',
        depot_id: 'PELIYAGODA',
        trips: [],
        deferred: [],
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await publishRoute(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.plan_id).toBe('PLAN-20261001-TEST');
  });

  it('publishes plan with trip stops where order was previously committed without unique constraint violation', async () => {
    const req = new Request('http://localhost:3000/api/dispatcher/plans/publish', {
      method: 'POST',
      body: JSON.stringify({
        plan_id: 'PLAN-20261003-PELIYAGODA',
        plan_date: '2026-10-03',
        depot_id: 'PELIYAGODA',
        trips: [
          {
            vehicle_id: 'VEH001',
            trip_number: 1,
            brand: 'Fresh',
            district: 'Colombo',
            depot: 'PELIYAGODA',
            total_weight_kg: 850,
            total_volume_m3: 4.5,
            duration_minutes: 120,
            orders: [{ order_id: 'ORD-20261001-001', brand: 'Fresh', district: 'Colombo', depot: 'PELIYAGODA', weight: 850, volume: 4.5 }],
            stops: [{ order_id: 'ORD-20261001-001', outlet_id: 'OUT001' }],
          },
        ],
        deferred: [],
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await publishRoute(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it('rejects publishing when plan_id or plan_date is missing', async () => {
    const req = new Request('http://localhost:3000/api/dispatcher/plans/publish', {
      method: 'POST',
      body: JSON.stringify({
        depot_id: 'PELIYAGODA',
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await publishRoute(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it('returns 500 when database transaction encounters an error', async () => {
    const { pool } = await import('../lib/db');
    const mockClient = {
      query: vi
        .fn()
        .mockResolvedValueOnce({}) // BEGIN
        .mockRejectedValueOnce(new Error('DB Constraint Violation')), // query fails
      release: vi.fn(),
    };
    vi.spyOn(pool, 'connect').mockResolvedValueOnce(mockClient as any);

    const req = new Request('http://localhost:3000/api/dispatcher/plans/publish', {
      method: 'POST',
      body: JSON.stringify({
        plan_id: 'PLAN-FAIL-TEST',
        plan_date: '2026-10-01',
        depot_id: 'PELIYAGODA',
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await publishRoute(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.message).toContain('DB Constraint Violation');
  });
});
