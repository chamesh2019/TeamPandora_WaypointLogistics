import { NextResponse } from "next/server";
import type { ApiSuccessResponse, ApiErrorResponse } from "../types/store-api";

/**
 * Creates a standard JSON success response matching ApiSuccessResponse<T>
 */
export function apiSuccess<T>(
  data: T,
  status = 200,
  meta?: Partial<NonNullable<ApiSuccessResponse<T>["meta"]>>
): NextResponse<ApiSuccessResponse<T>> {
  const body: ApiSuccessResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
  return NextResponse.json(body, { status });
}

/**
 * Creates a standard JSON error response matching ApiErrorResponse
 */
export function apiError(
  code: string,
  message: string,
  status = 400,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  const body: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
  };
  return NextResponse.json(body, { status });
}
