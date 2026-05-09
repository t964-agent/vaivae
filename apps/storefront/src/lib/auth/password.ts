import { z } from "zod";

export const PASSWORD_MIN_LENGTH = 12;

export const passwordRequirementText =
  "Use at least 12 characters with uppercase, lowercase, and a number.";

export function hasPasswordComplexity(password: string): boolean {
  return /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password);
}

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters.`)
  .refine(hasPasswordComplexity, passwordRequirementText);
