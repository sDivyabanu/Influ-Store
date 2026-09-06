import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "@/lib/errors";

function flattenZodErrors(error: ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const field = issue.path.join(".") || "_";
    if (!fieldErrors[field]) fieldErrors[field] = [];
    fieldErrors[field].push(issue.message);
  }
  return fieldErrors;
}

/**
 * Central error → HTTP response translator for API route handlers.
 * Keeps raw database/internal errors out of client-facing responses.
 */
export function handleApiError(error: unknown, fallbackMessage: string) {
  if (error instanceof ZodError) {
    const errors = flattenZodErrors(error);
    return NextResponse.json(
      {
        success: false,
        message: error.issues[0]?.message || "Invalid request.",
        errors,
      },
      { status: 400 }
    );
  }

  if (error instanceof AppError) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: error.status }
    );
  }

  console.error(fallbackMessage, error);
  return NextResponse.json(
    { success: false, message: fallbackMessage },
    { status: 500 }
  );
}
