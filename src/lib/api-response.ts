import { NextResponse } from "next/server";

interface ApiError {
  code: string;
  message: string;
}

interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
}

export function successResponse<T>(data: T, meta?: PaginationMeta, status = 200) {
  return NextResponse.json({ success: true, data, meta }, { status });
}

export function errorResponse(code: string, message: string, status = 400) {
  const error: ApiError = { code, message };
  return NextResponse.json({ success: false, error }, { status });
}

export function paginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "12")));
  return { page, pageSize, skip: (page - 1) * pageSize };
}
