import { z } from "zod";

export const createNoteSchema = z.object({
  title: z.string().min(1, "Title must be at least 1 characters"),
  content: z.string().min(5, "Content must be at least 5 characters"),
});

export const updateNoteSchema = createNoteSchema
  .partial()
  .refine((data) => data.title !== undefined || data.content !== undefined, {
    message: "At least one field must be provided",
  });
