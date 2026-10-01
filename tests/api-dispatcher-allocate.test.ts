import { describe, it, expect, vi } from 'vitest';
import { POST as allocateRoute } from '../app/api/dispatcher/allocate/route';
import { POST as publishRoute } from '../app/api/dispatcher/plans/publish/route';

describe('POST /api/dispatcher/allocate', () => {
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
});
