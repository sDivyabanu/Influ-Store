import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { listApplications } from "@/lib/services/admin-seller-application.service";
import { cursorPaginationSchema } from "@/lib/validations/pagination.schema";
import { handleApiError } from "@/lib/api/handle-error";

const statusFilterSchema = z.enum(["PENDING", "APPROVED", "REJECTED", "DRAFT"]).optional();

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const { cursor, limit } = cursorPaginationSchema.parse({
      cursor: searchParams.get("cursor") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });
    const status = statusFilterSchema.parse(searchParams.get("status") ?? undefined);

    const page = await listApplications(status, cursor, limit);
    return NextResponse.json(
      { success: true, applications: page.items, nextCursor: page.nextCursor },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, "Failed to load seller applications.");
  }
}
