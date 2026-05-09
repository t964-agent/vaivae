import "server-only";

import type { HttpTypes } from "@medusajs/types";
import { cache } from "react";

import { getAuthToken } from "@/medusa/auth-cookie";
import { getMedusaClient } from "@/medusa/client";
import type { StoreCustomer, StoreCustomerAddress, StoreOrder } from "@/medusa/types";

export const customerQueryParams = {
  fields: "id,email,first_name,last_name,phone,*addresses",
} as const;

export type CustomerAuthHeaders = {
  Authorization: string;
};

export type ListOrdersInput = {
  limit?: number | undefined;
  offset?: number | undefined;
  status?: StoreOrder["status"] | undefined;
};

export type ListOrdersResult = {
  count: number;
  hasMore: boolean;
  orders: StoreOrder[];
};

export type CustomerAddressInput = HttpTypes.StoreCreateCustomerAddress;
export type CustomerAddressUpdateInput = HttpTypes.StoreUpdateCustomerAddress;

const orderListQueryParams = {
  fields:
    "id,display_id,status,total,currency_code,created_at,updated_at,*items,*items.variant,*items.product",
} as const;

const orderDetailQueryParams = {
  fields:
    "id,display_id,status,total,subtotal,item_total,tax_total,shipping_total,discount_total,currency_code,created_at,updated_at,*items,*items.variant,*items.variant.options,*items.variant.options.option,*items.product,*shipping_address,*billing_address,*shipping_methods,*payment_collections,*fulfillments",
} as const;

const addressQueryParams = {
  fields:
    "id,address_name,first_name,last_name,company,address_1,address_2,city,country_code,province,postal_code,phone,is_default_shipping,is_default_billing,created_at,updated_at",
  limit: 100,
} as const;

type OrderListQuery = NonNullable<
  Parameters<ReturnType<typeof getMedusaClient>["store"]["order"]["list"]>[0]
>;

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

function normalizeLimit(limit: number | undefined, fallback: number): number {
  if (typeof limit !== "number" || !Number.isFinite(limit)) {
    return fallback;
  }

  return Math.min(100, Math.max(1, Math.round(limit)));
}

function normalizeOffset(offset: number | undefined): number {
  if (typeof offset !== "number" || !Number.isFinite(offset)) {
    return 0;
  }

  return Math.max(0, Math.round(offset));
}

function requireAuthToken(token: string | undefined): string {
  if (!token) {
    throw new Error("Sign in to continue.");
  }

  return token;
}

export async function listOrders(input: ListOrdersInput = {}): Promise<ListOrdersResult> {
  const token = requireAuthToken(await getAuthToken());
  const limit = normalizeLimit(input.limit, 10);
  const offset = normalizeOffset(input.offset);
  const query: OrderListQuery = {
    ...orderListQueryParams,
    limit,
    offset,
    order: "-created_at",
  };

  if (input.status) {
    query.status = input.status as NonNullable<OrderListQuery["status"]>;
  }

  const { count, orders } = await getMedusaClient().store.order.list(
    query,
    getCustomerAuthHeaders(token),
  );

  return {
    count,
    hasMore: offset + orders.length < count,
    orders,
  };
}

export async function retrieveOrder(orderId: string): Promise<StoreOrder | null> {
  const normalizedOrderId = orderId.trim();

  if (!normalizedOrderId) {
    return null;
  }

  const token = requireAuthToken(await getAuthToken());
  const query: OrderListQuery = {
    ...orderDetailQueryParams,
    id: normalizedOrderId,
    limit: 1,
    offset: 0,
  };
  const { orders } = await getMedusaClient().store.order.list(query, getCustomerAuthHeaders(token));

  return orders[0] ?? null;
}

export async function listAddresses(): Promise<StoreCustomerAddress[]> {
  const token = requireAuthToken(await getAuthToken());
  const { addresses } = await getMedusaClient().store.customer.listAddress(
    addressQueryParams,
    getCustomerAuthHeaders(token),
  );

  return addresses;
}

export async function createAddress(data: CustomerAddressInput): Promise<StoreCustomer> {
  const token = requireAuthToken(await getAuthToken());
  const { customer } = await getMedusaClient().store.customer.createAddress(
    data,
    customerQueryParams,
    getCustomerAuthHeaders(token),
  );

  return customer;
}

export async function updateAddress(
  id: string,
  data: CustomerAddressUpdateInput,
): Promise<StoreCustomer> {
  const normalizedId = id.trim();

  if (!normalizedId) {
    throw new Error("Address ID is required.");
  }

  const token = requireAuthToken(await getAuthToken());
  const { customer } = await getMedusaClient().store.customer.updateAddress(
    normalizedId,
    data,
    customerQueryParams,
    getCustomerAuthHeaders(token),
  );

  return customer;
}

export async function deleteAddress(id: string): Promise<StoreCustomer> {
  const normalizedId = id.trim();

  if (!normalizedId) {
    throw new Error("Address ID is required.");
  }

  const token = requireAuthToken(await getAuthToken());

  await getMedusaClient().store.customer.deleteAddress(normalizedId, getCustomerAuthHeaders(token));

  const customer = await retrieveCustomerWithToken(token);

  if (!customer) {
    throw new Error("Customer session expired.");
  }

  return customer;
}
