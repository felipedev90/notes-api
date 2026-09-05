import { z } from "zod";

export const registerSchema = z.object({
  userName: z.string().min(2, "User name must be at least 2 characters"),
  email: z.string().email("Invalid e-mail"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid e-mail"),
  password: z.string().min(1, "Password required "),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
