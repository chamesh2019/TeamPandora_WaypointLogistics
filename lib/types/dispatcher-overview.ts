export interface DispatcherOverviewKpiMetric {
  value: string | number;
  note: string;
  bars: number[];
  trend?: "up" | "down" | "neutral";
}

export interface DispatcherOverviewKpisDto {
  confirmedOrders: {
    count: number;
    trendNote: string;
    bars: number[];
  };
  activeFleet: {
    activeCount: number;
    totalCount: number;
    idleCount: number;
    fleetNote: string;
    bars: number[];
  };
  lateRisk: {
    count: number;
    confidenceNote: string;
    bars: number[];
  };
  cutoffTimer: {
    formattedTimeLeft: string;
    note: string;
    isAfterCutoff: boolean;
    hoursRemaining: number;
    minutesRemaining: number;
    bars: number[];
  };
}

export interface DispatcherOverviewOrderItem {
  id: string;
  orderId: string;
  outlet: string;
  outletId?: string;
  brand: "Fresh" | "Style" | "Tech";
  district: string;
  temperature: "Chilled" | "Ambient" | "Frozen";
  weight: string;
  weightKg?: number;
  volume: string;
  volumeM3?: number;
  priority: "High" | "Medium" | "Low";
  priorityScore?: number;
  units?: number;
  status?: string;
}

export interface DispatcherOverviewExceptionItem {
  id: string;
  title: string;
  subtitle: string;
  severity: "Critical" | "High" | "Medium";
  category: "breakdown" | "cold_chain" | "loading" | "late_delivery";
  time: string;
  tripId?: string;
  vehicleId?: string;
}

export interface DispatcherOverviewResponseData {
  kpis: DispatcherOverviewKpisDto;
  queue: DispatcherOverviewOrderItem[];
  totalUnallocatedCount: number;
  exceptions: DispatcherOverviewExceptionItem[];
  depots: Array<{ id: string; name: string }>;
  vehicles: Array<{ id: string; name: string; type: string; depotId: string }>;
  districts: string[];
}
