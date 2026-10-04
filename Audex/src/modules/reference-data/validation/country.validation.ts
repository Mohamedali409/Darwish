import { Types } from "mongoose";
import { z } from "zod";

export const updateCountrySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Country name must be at least 2 characters")
      .optional(),

    code: z
      .string()
      .trim()
      .length(2, "Country code must be exactly 2 characters")
      .toUpperCase()
      .optional(),
  })
  .refine((data) => data.name !== undefined || data.code !== undefined, {
    message: "At least one field is required",
  });

export function isValidCountryId(id: string): boolean {
  return Types.ObjectId.isValid(id);
}
