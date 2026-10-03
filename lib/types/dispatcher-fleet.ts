export interface DispatcherFleetVehicleDto {
  id: string;
  type: "truck" | "van";
  temp: "reefer" | "ambient";
  weightCapKg: number;
  volumeCapM3: number;
  fuelType: string;
  kmPerL: number;
  weeklyFuelQuotaL: number;
  fuelUsedThisWeekL: number;
  fuelRemainingL: number;
  fuelPct: number;
  depotId: string;
  dbStatus: "available" | "in_workshop";
  operationalStatus: "Active" | "Idle" | "Workshop";
  assignedDriverId: string | null;
  assignedDriverName: string | null;
  assignedDriverPhone: string | null;
  activeTripId: string | null;
  activeTripStatus: string | null;
  activeTripOrdersCount: number | null;
  odometerKm: number;
  engineTemp: string;
  lastService: string;
}

export interface DispatcherFleetKpiHistoryItem {
  date: string;
  value: number;
}

export interface DispatcherFleetKpiMetric {
  current: number;
  subtitle: string;
  history: DispatcherFleetKpiHistoryItem[];
}

export interface DispatcherFleetKpisResponseData {
  depotId: string;
  days: number;
  metrics: {
    totalFleet: DispatcherFleetKpiMetric;
    available: DispatcherFleetKpiMetric;
    reeferTrucks: DispatcherFleetKpiMetric;
    inWorkshop: DispatcherFleetKpiMetric;
  };
}

export interface DispatcherFleetResponseData {
  kpis: {
    totalFleet: number;
    available: number;
    active: number;
    reeferCount: number;
    inWorkshop: number;
  };
  vehicles: DispatcherFleetVehicleDto[];
  drivers: Array<{ id: string; name: string; phone?: string }>;
}

export interface UpdateFleetVehiclePayload {
  vehicleId: string;
  status?: "available" | "in_workshop";
  driverId?: string | null;
}
