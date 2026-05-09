import "server-only";

import { cache } from "react";

import { getAuthToken } from "@/medusa/auth-cookie";
import { getMedusaClient } from "@/medusa/client";
import type { StoreCustomer, StoreCustomerAddress } from "@/medusa/types";

export const customerQueryParams = {
  fields: "id,email,first_name,last_name,phone,*addresses",
} as const;

export type CustomerAuthHeaders = {
  Authorization: string;
};

function getErrorStatus(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null || !("status" in error)) {
    return undefined;
  }

  const status = (error as { status?: unknown }).status;

  return typeof status === "number" ? status : undefined;
}

function isAuthError(error: unknown): boolean {
  const status = getErrorStatus(error);

  return status === 401 || status === 403;
}

export function getCustomerAuthHeaders(token: string): CustomerAuthHeaders {
  return { Authorization: `Bearer ${token}` };
}

export async function retrieveCustomerWithToken(token: string): Promise<StoreCustomer | null> {
  const normalizedToken = token.trim();

  if (!normalizedToken) {
    return null;
  }

  try {
    const { customer } = await getMedusaClient().store.customer.retrieve(
      customerQueryParams,
      getCustomerAuthHeaders(normalizedToken),
    );

    return customer;
  } catch (error) {
    if (isAuthError(error)) {
      return null;
    }

    throw error;
  }
}

export const getCurrentCustomer = cache(async (): Promise<StoreCustomer | null> => {
  const token = await getAuthToken();

  if (!token) {
    return null;
  }

  return retrieveCustomerWithToken(token);
});

export const getCustomerAddresses = cache(async (): Promise<StoreCustomerAddress[]> => {
  const customer = await getCurrentCustomer();

  return customer?.addresses ?? [];
});

export async function isAuthenticated(): Promise<boolean> {
  return (await getCurrentCustomer()) !== null;
}
