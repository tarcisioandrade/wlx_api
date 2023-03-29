import mongoose from "mongoose";
import { z } from "zod";

export const validatorSignupSchema = z.object({
  name: z
    .string()
    .min(2)
    .transform((val) => val.trim()),
  email: z
    .string()
    .email()
    .transform((val) => val.trim()),
  password: z.string().min(6),
  state: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid state.",
  }),
});

export const validatorSigninSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
