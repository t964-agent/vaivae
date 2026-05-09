import type { StoreCartShippingOption } from "@/medusa/types";

export type CheckoutStep =
  | "contact"
  | "shipping-address"
  | "shipping-method"
  | "payment"
  | "review";

export type CheckoutContactData = {
  email: string;
  phone: string;
};

export type CheckoutAddressData = {
  address1: string;
  address2: string;
  city: string;
  country: "US";
  firstName: string;
  lastName: string;
  phone: string;
  postalCode: string;
  state: string;
};

export type CheckoutShippingOption = StoreCartShippingOption;
