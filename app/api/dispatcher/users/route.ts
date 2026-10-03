import { NextResponse } from "next/server";
import { requireDispatcher } from "../../../../lib/api/guard";
import { apiSuccess, apiError } from "../../../../lib/api/response";
import { DispatcherService } from "../../../../lib/services/dispatcher-service";
import type { CreateDispatcherUserPayload, UpdateDispatcherUserPayload } from "../../../../lib/types/dispatcher-api";

export async function GET(request: Request) {
  try {
    const authResult = await requireDispatcher(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role") || undefined;
    const search = searchParams.get("search") || undefined;
    const depotId = searchParams.get("depotId") || undefined;

    const data = await DispatcherService.getUsers({
      role,
      search,
      depotId,
    });

    return apiSuccess(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to retrieve users";
    return apiError("INTERNAL_ERROR", message, 500);
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await requireDispatcher(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = (await request.json().catch(() => ({}))) as Partial<CreateDispatcherUserPayload>;
    const { name, username, email, password, role, depotId, outletId, phoneNumber } = body;

    if (!name || !username || !email || !password || !role) {
      return apiError(
        "BAD_REQUEST",
        "name, username, email, password, and role are required fields",
        400
      );
    }

    const result = await DispatcherService.createUser({
      name,
      username,
      email,
      password,
      role,
      depotId: depotId || null,
      outletId: outletId || null,
      phoneNumber: phoneNumber || null,
    });

    return apiSuccess(result, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create user";
    const isConstraintError =
      (err as any)?.code === "23505" ||
      message.toLowerCase().includes("duplicate") ||
      message.toLowerCase().includes("already") ||
      message.toLowerCase().includes("taken") ||
      message.toLowerCase().includes("exists") ||
      message.toLowerCase().includes("password") ||
      message.toLowerCase().includes("required") ||
      message.toLowerCase().includes("invalid");

    if (isConstraintError) {
      return apiError("BAD_REQUEST", message, 400);
    }
    return apiError("INTERNAL_ERROR", message, 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const authResult = await requireDispatcher(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = (await request.json().catch(() => ({}))) as Partial<UpdateDispatcherUserPayload>;
    const { userId, name, role, depotId, outletId, phoneNumber, status } = body;

    if (!userId) {
      return apiError("BAD_REQUEST", "userId is required for update", 400);
    }

    const result = await DispatcherService.updateUser(userId, {
      userId,
      name,
      role,
      depotId,
      outletId,
      phoneNumber,
      status,
    });

    return apiSuccess(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update user";
    if (message.toLowerCase().includes("not found") || message.toLowerCase().includes("required")) {
      return apiError("BAD_REQUEST", message, 400);
    }
    return apiError("INTERNAL_ERROR", message, 500);
  }
}
