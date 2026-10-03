export type DispatcherUserRole = "dispatcher" | "driver" | "loader" | "store_manager";

export interface DispatcherUserDto {
  id: string;
  name: string;
  username: string;
  email: string | null;
  role: DispatcherUserRole;
  depotId: string | null;
  outletId: string | null;
  phoneNumber: string | null;
  status: "Active" | "Locked";
  createdAt: string;
  lastLogin?: string;
}

export interface DispatcherUsersKpisDto {
  total: number;
  dispatchers: number;
  drivers: number;
  loaders: number;
  storeManagers: number;
}

export interface DispatcherUsersResponseData {
  kpis: DispatcherUsersKpisDto;
  users: DispatcherUserDto[];
  depots: string[];
  outlets: Array<{ outletId: string; name: string }>;
}

export interface CreateDispatcherUserPayload {
  name: string;
  username: string;
  email: string;
  password: string;
  role: DispatcherUserRole;
  depotId?: string | null;
  outletId?: string | null;
  phoneNumber?: string | null;
}

export interface UpdateDispatcherUserPayload {
  userId: string;
  name?: string;
  role?: DispatcherUserRole;
  depotId?: string | null;
  outletId?: string | null;
  phoneNumber?: string | null;
  status?: "Active" | "Locked";
}
