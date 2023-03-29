import { z } from "zod";

export const userValidatorSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  state: z.string().optional(),
});
