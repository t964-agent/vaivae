"use server";

import { revalidateTag } from "next/cache";
import { z } from "zod";

import { passwordSchema } from "@/lib/auth/password";
import { getCartId, setCartId } from "@/medusa/cart-cookie";
import { clearAuthToken, extendAuthToken, getAuthToken, setAuthToken } from "@/medusa/auth-cookie";
import { getMedusaClient } from "@/medusa/client";
import {
  customerQueryParams,
  getCustomerAuthHeaders,
  retrieveCustomerWithToken,
} from "@/medusa/customer";
import type { StoreCustomer } from "@/medusa/types";
import { getPublicEnv } from "@/lib/env";

const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address.");
const nameSchema = z
  .string()
  .trim()
  .min(1, "Enter your name.")
  .max(80, "Use 80 characters or fewer.");
const optionalTrimmedString = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().optional(),
);
const optionalPhoneSchema = optionalTrimmedString.refine(
  (value) => !value || /^[+()\-\d\s.]{7,32}$/.test(value),
  "Enter a valid phone number.",
);

const registerSchema = z.object({
  email: emailSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  password: passwordSchema,
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password."),
});

const forgotPasswordSchema = z.object({
  email: emailSchema,
});

const resetPasswordSchema = z.object({
  email: emailSchema,
  newPassword: passwordSchema,
  token: z.string().trim().min(1, "Reset token is missing."),
});

const updateProfileSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  phone: optionalPhoneSchema,
});

const updatePasswordSchema = z.object({
  newPassword: passwordSchema,
});

type RegisterInput = z.input<typeof registerSchema>;
type LoginInput = z.input<typeof loginSchema>;
type ForgotPasswordInput = z.input<typeof forgotPasswordSchema>;
type ResetPasswordInput = z.input<typeof resetPasswordSchema>;
type UpdateProfileInput = z.input<typeof updateProfileSchema>;
type UpdatePasswordInput = z.input<typeof updatePasswordSchema>;
type RegisterData = z.output<typeof registerSchema>;
type LoginData = z.output<typeof loginSchema>;

export type AuthCustomerActionData = {
  customerId: string;
};
export type AuthActionResult<TData> = { data: TData; ok: true } | { error: string; ok: false };
export type SimpleAuthActionResult = { ok: true } | { error: string; ok: false };

class MedusaAuthRequestError extends Error {
  readonly status: number;

  constructor(status: number, message = "Medusa auth request failed.") {
    super(message);
    this.name = "MedusaAuthRequestError";
    this.status = status;
  }
}

function getValidationError(error: z.ZodError): { error: string; ok: false } {
  return { error: error.issues[0]?.message ?? "Check the form and try again.", ok: false };
}

function getAuthBaseUrl(): string {
  return getPublicEnv().NEXT_PUBLIC_MEDUSA_BACKEND_URL.replace(/\/+$/, "");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getTokenFromResponse(data: unknown): string | null {
  if (!isRecord(data)) {
    return null;
  }

  const token = data["token"];

  return typeof token === "string" && token.trim() ? token : null;
}

function isConflictLikeError(error: unknown): boolean {
  return error instanceof MedusaAuthRequestError && (error.status === 400 || error.status === 409);
}

async function postMedusaAuth(
  path: string,
  body: Record<string, unknown>,
  token?: string,
): Promise<unknown> {
  const headers = new Headers({ "content-type": "application/json" });

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${getAuthBaseUrl()}${path}`, {
    body: JSON.stringify(body),
    cache: "no-store",
    headers,
    method: "POST",
  });

  if (!response.ok) {
    throw new MedusaAuthRequestError(response.status);
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return null;
  }

  return response.json();
}

async function postMedusaToken(path: string, body: Record<string, unknown>): Promise<string> {
  const data = await postMedusaAuth(path, body);
  const token = getTokenFromResponse(data);

  if (!token) {
    throw new MedusaAuthRequestError(502, "Medusa auth response did not include a token.");
  }

  return token;
}

async function createRegisteredCustomer(data: RegisterData, token: string): Promise<StoreCustomer> {
  const { customer } = await getMedusaClient().store.customer.create(
    {
      email: data.email,
      first_name: data.firstName,
      last_name: data.lastName,
    },
    customerQueryParams,
    getCustomerAuthHeaders(token),
  );

  return customer;
}

async function linkCartToCustomer(customer: StoreCustomer, token: string): Promise<void> {
  const cartId = await getCartId();

  if (!cartId || !customer.email) {
    return;
  }

  const { NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY } = getPublicEnv();
  const response = await fetch(`${getAuthBaseUrl()}/store/carts/${cartId}`, {
    body: JSON.stringify({ email: customer.email }),
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
      "content-type": "application/json",
      "x-publishable-api-key": NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
    },
    method: "POST",
  });

  if (!response.ok) {
    return;
  }

  const data: unknown = await response.json().catch(() => null);

  if (isRecord(data) && isRecord(data["cart"])) {
    const nextCartId = data["cart"]["id"];

    if (typeof nextCartId === "string" && nextCartId.trim()) {
      await setCartId(nextCartId);
    }
  }

  revalidateTag("cart", { expire: 0 });
}

async function establishLogin(data: LoginData): Promise<AuthActionResult<AuthCustomerActionData>> {
  const token = await postMedusaToken("/auth/customer/emailpass", {
    email: data.email,
    password: data.password,
  });
  const customer = await retrieveCustomerWithToken(token);

  if (!customer) {
    throw new MedusaAuthRequestError(401);
  }

  await setAuthToken(token);
  await linkCartToCustomer(customer, token);

  return { data: { customerId: customer.id }, ok: true };
}

export async function registerAction(
  input: RegisterInput,
): Promise<AuthActionResult<AuthCustomerActionData>> {
  const parsed = registerSchema.safeParse(input);

  if (!parsed.success) {
    return getValidationError(parsed.error);
  }

  try {
    const token = await postMedusaToken("/auth/customer/emailpass/register", {
      email: parsed.data.email,
      password: parsed.data.password,
    });
    const customer = await createRegisteredCustomer(parsed.data, token);

    await setAuthToken(token);
    await linkCartToCustomer(customer, token);

    return { data: { customerId: customer.id }, ok: true };
  } catch (error) {
    if (isConflictLikeError(error)) {
      try {
        return await establishLogin({ email: parsed.data.email, password: parsed.data.password });
      } catch {
        return {
          error: "An account may already exist. Sign in with your password or reset it.",
          ok: false,
        };
      }
    }

    return { error: "Unable to create your account. Try again in a moment.", ok: false };
  }
}

export async function loginAction(
  input: LoginInput,
): Promise<AuthActionResult<AuthCustomerActionData>> {
  const parsed = loginSchema.safeParse(input);

  if (!parsed.success) {
    return getValidationError(parsed.error);
  }

  try {
    return await establishLogin(parsed.data);
  } catch {
    return { error: "Email or password is incorrect.", ok: false };
  }
}

export async function logoutAction(): Promise<SimpleAuthActionResult> {
  try {
    await getMedusaClient().auth.logout();
  } catch {
    // JWT storefront auth is cleared locally below; Medusa has no required revoke step for this flow.
  }

  await clearAuthToken();

  return { ok: true };
}

export async function forgotPasswordAction(
  input: ForgotPasswordInput,
): Promise<SimpleAuthActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input);

  if (!parsed.success) {
    return getValidationError(parsed.error);
  }

  try {
    await postMedusaAuth("/auth/customer/emailpass/reset-password", {
      identifier: parsed.data.email,
    });
  } catch {
    // Return the same response for all valid emails to avoid account enumeration.
  }

  return { ok: true };
}

export async function resetPasswordAction(
  input: ResetPasswordInput,
): Promise<SimpleAuthActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);

  if (!parsed.success) {
    return getValidationError(parsed.error);
  }

  try {
    await postMedusaAuth(
      "/auth/customer/emailpass/update",
      {
        email: parsed.data.email,
        password: parsed.data.newPassword,
      },
      parsed.data.token,
    );

    return { ok: true };
  } catch {
    return { error: "Unable to reset that password. Request a new link and try again.", ok: false };
  }
}

export async function updateProfileAction(
  input: UpdateProfileInput,
): Promise<AuthActionResult<AuthCustomerActionData>> {
  const parsed = updateProfileSchema.safeParse(input);

  if (!parsed.success) {
    return getValidationError(parsed.error);
  }

  const token = await getAuthToken();

  if (!token) {
    return { error: "Sign in to update your profile.", ok: false };
  }

  try {
    const { customer } = await getMedusaClient().store.customer.update(
      {
        first_name: parsed.data.firstName,
        last_name: parsed.data.lastName,
        phone: parsed.data.phone ?? null,
      },
      customerQueryParams,
      getCustomerAuthHeaders(token),
    );

    await extendAuthToken(token);

    return { data: { customerId: customer.id }, ok: true };
  } catch {
    return { error: "Unable to update your profile. Try again in a moment.", ok: false };
  }
}

export async function updatePasswordAction(
  input: UpdatePasswordInput,
): Promise<SimpleAuthActionResult> {
  const parsed = updatePasswordSchema.safeParse(input);

  if (!parsed.success) {
    return getValidationError(parsed.error);
  }

  const token = await getAuthToken();

  if (!token) {
    return { error: "Sign in to update your password.", ok: false };
  }

  const customer = await retrieveCustomerWithToken(token);

  if (!customer?.email) {
    return { error: "Sign in again before updating your password.", ok: false };
  }

  try {
    await postMedusaAuth(
      "/auth/customer/emailpass/update",
      {
        email: customer.email,
        password: parsed.data.newPassword,
      },
      token,
    );
    await extendAuthToken(token);

    return { ok: true };
  } catch {
    return { error: "Unable to update your password. Try again in a moment.", ok: false };
  }
}
