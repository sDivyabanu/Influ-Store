import { z } from "zod";

export const cursorPaginationSchema = z.object({
  cursor: z.string().trim().min(1).optional().nullable(),
  limit: z.coerce.number().int().positive().max(50).optional(),
});
export type CursorPaginationInput = z.infer<typeof cursorPaginationSchema>;
