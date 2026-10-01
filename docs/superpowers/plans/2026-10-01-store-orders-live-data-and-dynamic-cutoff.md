# Store Orders Live Data and Dynamic Cutoff Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect the store orders view to live REST API data with automated post-order refresh, dynamic dashboard metrics, and a real-time 16:00 cutoff countdown across the store views and order modal.

**Architecture:** Introduce a centralized cutoff utility (`lib/utils/cutoff.ts`) evaluating local store operational timezone (`Asia/Colombo`, UTC+5:30) against the 16:00 daily cutoff. Wire `PlaceOrderForm` to use dynamic countdown timing and call `onSuccess` upon order placement. Transform `app/store/orders/page.tsx` from static mock data to an API-driven client component fetching `/api/store/orders` and `/api/store/overview`, supporting loading/empty states and reactive table reloads.

**Tech Stack:** Next.js 15 App Router (React 19 Client Components), TypeScript, Tailwind CSS, Lucide icons, Vitest.

**Spec:** Items 1 and 3 from Store Views & Order Creation Review:
1. Connect store orders view table and stat metrics to live REST API endpoints (`GET /api/store/orders`, `GET /api/store/overview`) and trigger automatic re-fetch on `PlaceOrderForm` success.
2. Replace static cutoff text with real-time dynamic countdown and rollover indicators in both `PlaceOrderForm` and `OrdersPage`.

## Global Constraints

- Operational timezone for store cutoff is `Asia/Colombo` (UTC+5:30) with a daily cutoff hour of 16:00 (4:00 PM), matching `StoreService.checkIsAfterCutoff`.
- All API communication must use existing endpoints (`/api/store/orders`, `/api/store/overview`) and respect existing response envelope schema (`ApiSuccessResponse<T>` / `ApiErrorResponse`).
- Visual layout, color palette (e.g. amber cutoff alert `#B45309`, `#FFF8EC`, `#FDE5BD`, neutral background `#E9EDF3`), and typography must remain 100% consistent with the existing design system.
- Zero regression on existing integration tests in `tests/store-forms-integration.test.ts` and `tests/store-orders-routes.test.ts`.

## Review Focus

1. **Cutoff Boundary Transition (15:59 vs 16:00):** Must correctly display remaining minutes at 15:59 and flip to rollover warning at 16:00 without negative countdowns or NaN.
2. **Empty Order State:** Must gracefully render a clear empty state in the orders table when an outlet has 0 orders, instead of broken tables or infinite spinners.
3. **API Error Resilience:** Network failures or non-200 responses from `/api/store/orders` must render a user-friendly retryable error alert without breaking page layout.
4. **Reactive Re-fetch on Success:** Placing an order through `PlaceOrderForm` must immediately refresh order history and KPI stat cards without requiring a manual browser refresh.
5. **Hydration / SSR Safety:** Timezone and timer computations must safely initialize on the client without throwing React hydration mismatch warnings.

---

### Task 1: Centralized Cutoff Countdown Utility

**Files:**
- Create: `lib/utils/cutoff.ts`
- Test: `tests/cutoff-utility.test.ts`

**Interfaces:**
- Consumes: Native `Date`, `Intl.DateTimeFormat` with `timeZone: "Asia/Colombo"`.
- Produces:
  ```ts
  export interface CutoffInfo {
    cutoffHour: number;
    isAfterCutoff: boolean;
    hoursRemaining: number;
    minutesRemaining: number;
    formattedTimeLeft: string;
    bannerText: string;
    statNoteText: string;
  }
  export function getCutoffInfo(now?: Date): CutoffInfo;
  ```

- [ ] **Step 1: Write failing tests for cutoff utility**

```ts
// tests/cutoff-utility.test.ts
import { describe, it, expect } from "vitest";
import { getCutoffInfo } from "../lib/utils/cutoff";

describe("Cutoff Countdown Utility", () => {
  it("calculates remaining time before 16:00 in Asia/Colombo", () => {
    // 09:15 Colombo time (03:45 UTC)
    const morning = new Date("2026-10-01T03:45:00Z");
    const info = getCutoffInfo(morning);
    expect(info.isAfterCutoff).toBe(false);
    expect(info.hoursRemaining).toBe(6);
    expect(info.minutesRemaining).toBe(45);
    expect(info.formattedTimeLeft).toBe("6h 45m remaining");
    expect(info.bannerText).toContain("Cutoff: 16:00 today · 6h 45m remaining");
    expect(info.statNoteText).toBe("Today · 6h 45m left");
  });

  it("handles 1 minute before cutoff (15:59 Colombo time)", () => {
    // 15:59 Colombo time (10:29 UTC)
    const almostCutoff = new Date("2026-10-01T10:29:00Z");
    const info = getCutoffInfo(almostCutoff);
    expect(info.isAfterCutoff).toBe(false);
    expect(info.hoursRemaining).toBe(0);
    expect(info.minutesRemaining).toBe(1);
    expect(info.formattedTimeLeft).toBe("1m remaining");
    expect(info.statNoteText).toBe("Today · 1m left");
  });

  it("detects after cutoff (16:00 Colombo time and later)", () => {
    // 16:00 Colombo time (10:30 UTC)
    const atCutoff = new Date("2026-10-01T10:30:00Z");
    const info = getCutoffInfo(atCutoff);
    expect(info.isAfterCutoff).toBe(true);
    expect(info.hoursRemaining).toBe(0);
    expect(info.minutesRemaining).toBe(0);
    expect(info.bannerText).toContain("Cutoff passed (16:00) · Next run rollover");
    expect(info.statNoteText).toBe("Passed · Next cycle");
  });

  it("handles late evening after cutoff (21:30 Colombo time)", () => {
    // 21:30 Colombo time (16:00 UTC)
    const evening = new Date("2026-10-01T16:00:00Z");
    const info = getCutoffInfo(evening);
    expect(info.isAfterCutoff).toBe(true);
    expect(info.bannerText).toContain("Cutoff passed (16:00)");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/cutoff-utility.test.ts`
Expected: FAIL with "Cannot find module '../lib/utils/cutoff'"

- [ ] **Step 3: Implement `lib/utils/cutoff.ts`**

Implement `getCutoffInfo(now: Date = new Date()): CutoffInfo` extracting Colombo hour and minute via `Intl.DateTimeFormat("en-US", { timeZone: "Asia/Colombo", hour12: false })`, calculating minute distance to `16 * 60 = 960` minutes, and formatting output copy.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/cutoff-utility.test.ts`
Expected: PASS (4 tests passing)

- [ ] **Step 5: Commit**

```bash
git add lib/utils/cutoff.ts tests/cutoff-utility.test.ts
git commit -m "feat(store): add cutoff countdown utility with Asia/Colombo timezone support"
```

---

### Task 2: Connect Dynamic Cutoff Countdown to PlaceOrderForm

**Files:**
- Modify: `app/store/orders/place-order-form.tsx:265-277`
- Test: `tests/store-forms-integration.test.ts`

**Interfaces:**
- Consumes: `getCutoffInfo` from `lib/utils/cutoff`
- Produces: `PlaceOrderForm` with live dynamic cutoff banner state updating every 60s and immediately reflecting time-of-day rollover.

- [ ] **Step 1: Write the failing test in `tests/store-forms-integration.test.ts`**

Add test assertions verifying:
1. `PlaceOrderForm` imports and uses `getCutoffInfo`.
2. `PlaceOrderForm` renders dynamic cutoff copy reflecting the utility output.
3. Cutoff banner container applies conditional alert styling if past cutoff.

```ts
it("displays dynamic cutoff countdown instead of static hardcoded string", () => {
  const source = fs.readFileSync(
    path.resolve(__dirname, "../app/store/orders/place-order-form.tsx"),
    "utf-8"
  );
  expect(source).toContain("getCutoffInfo");
  expect(source).not.toContain("Cutoff: 16:00 today · 2h 14m remaining");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/store-forms-integration.test.ts`
Expected: FAIL with `expected source to not contain 'Cutoff: 16:00 today · 2h 14m remaining'`

- [ ] **Step 3: Implement dynamic cutoff in `app/store/orders/place-order-form.tsx`**

1. Import `getCutoffInfo` from `@/lib/utils/cutoff`.
2. Add state `const [cutoffInfo, setCutoffInfo] = useState(() => getCutoffInfo());`.
3. Add `useEffect` with `setInterval(() => setCutoffInfo(getCutoffInfo()), 60000)` to keep countdown live.
4. Replace hardcoded `"Cutoff: 16:00 today · 2h 14m remaining"` with `{cutoffInfo.bannerText}`.
5. If `cutoffInfo.isAfterCutoff` is true, display amber rollover indicator notice in the banner.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/store-forms-integration.test.ts`
Expected: PASS (18 tests passing)

- [ ] **Step 5: Commit**

```bash
git add app/store/orders/place-order-form.tsx tests/store-forms-integration.test.ts
git commit -m "feat(store): connect dynamic cutoff countdown in place-order form"
```

---

### Task 3: Implement Live Orders Data Fetching, Dynamic Stat Cards, and Reactive Reload in Store Orders Page

**Files:**
- Modify: `app/store/orders/page.tsx:1-231`
- Create: `tests/store-orders-page.test.ts`

**Interfaces:**
- Consumes:
  - `GET /api/store/orders` (`StoreOrderSummaryDto[]`, meta pagination)
  - `GET /api/store/overview` (`StoreOverviewDto`)
  - `getCutoffInfo` from `lib/utils/cutoff`
  - `PlaceOrderForm` with `onSuccess={() => reloadOrders()}`
- Produces:
  - `OrdersPage` (React client component) rendering live order history, dynamic KPI stats, loading state, empty state, and auto-refresh on order placement.

- [ ] **Step 1: Write failing test in `tests/store-orders-page.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

describe("Store Orders Page Live Integration", () => {
  const pagePath = path.resolve(__dirname, "../app/store/orders/page.tsx");
  const code = fs.readFileSync(pagePath, "utf-8");

  it("fetches orders from /api/store/orders instead of using static orderRows", () => {
    expect(code).toContain("/api/store/orders");
    expect(code).not.toMatch(/const orderRows\s*=\s*\[\s*\{\s*id:\s*"ORD-250614-2901"/);
  });

  it("passes onSuccess callback to PlaceOrderForm to trigger reload", () => {
    expect(code).toMatch(/<PlaceOrderForm[\s\S]*?onSuccess=/);
  });

  it("uses dynamic cutoff utility for the Order Cutoff stat card", () => {
    expect(code).toContain("getCutoffInfo");
    expect(code).not.toContain('note="Today · 2h 14m left"');
  });

  it("handles loading and empty states for the order table", () => {
    expect(code).toMatch(/loading|isLoading/i);
    expect(code).toMatch(/No orders found|No orders placed yet/i);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/store-orders-page.test.ts`
Expected: FAIL with assertions failing on static `orderRows` and missing `onSuccess`.

- [ ] **Step 3: Refactor `app/store/orders/page.tsx` for live data integration**

1. Replace static `orderRows` with state:
   - `orders`: `StoreOrderSummaryDto[]`
   - `overview`: `StoreOverviewDto | null`
   - `isLoading`: `boolean`
   - `error`: `string | null`
2. Implement `fetchData()`:
   - Calls `GET /api/store/orders` and `GET /api/store/overview`.
   - Populates state; handles error cleanly.
3. Mount `fetchData()` on `useEffect`.
4. Connect `PlaceOrderForm`:
   ```tsx
   <PlaceOrderForm
     onClose={() => setPlaceOrderOpen(false)}
     onSuccess={() => {
       fetchData();
     }}
   />
   ```
5. Wire StatCards:
   - "Open orders": Active count from `overview?.kpis.activeOrdersCount ?? orders.filter(o => ['SUBMITTED','CONFIRMED','PLANNED','IN_TRANSIT'].includes(o.lifecycleStatus)).length`.
   - "Next delivery": `overview?.kpis.nextArrival?.eta ?? "None planned"`.
   - "Delivered this month": count of delivered orders.
   - "Order cutoff": `cutoffInfo.statNoteText`.
6. Render table rows dynamically from `orders`:
   - Map `order.orderId`, `order.orderDate` or `order.createdAt`, `order.orderUnits` cartons, `order.orderVolumeM3` m³, `order.lifecycleStatus` with tone badge, `order.dispatchDate` or `deliveryDate`.
   - Render loading skeleton/row when `isLoading`.
   - Render friendly empty state when `!isLoading && orders.length === 0`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/store-orders-page.test.ts tests/store-forms-integration.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/store/orders/page.tsx tests/store-orders-page.test.ts
git commit -m "feat(store): connect store orders page to live api endpoints with reactive refresh"
```

---

### Task 4: End-to-End Verification & Full Test Suite

**Files:**
- Test: All tests in `tests/`

- [ ] **Step 1: Run complete vitest test suite for store features**

Run: `npx vitest run tests/cutoff-utility.test.ts tests/store-orders-page.test.ts tests/store-forms-integration.test.ts tests/store-orders-routes.test.ts`
Expected: All tests pass with 0 failures.

- [ ] **Step 2: TypeScript check and build verification**

Run: `npm run lint` or `npx tsc --noEmit`
Expected: Clean pass with 0 TypeScript/ESLint errors in modified files.

- [ ] **Step 3: Final verification commit if needed**
