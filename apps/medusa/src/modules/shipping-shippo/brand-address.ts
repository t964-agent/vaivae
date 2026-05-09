import type { AddressCreateRequest } from "shippo";
import type { MedusaEnv } from "../../lib/env";

type ShippoFromEnv = Pick<
  MedusaEnv,
  | "SHIPPO_FROM_CITY"
  | "SHIPPO_FROM_COMPANY"
  | "SHIPPO_FROM_COUNTRY_CODE"
  | "SHIPPO_FROM_EMAIL"
  | "SHIPPO_FROM_NAME"
  | "SHIPPO_FROM_PHONE"
  | "SHIPPO_FROM_POSTAL_CODE"
  | "SHIPPO_FROM_STATE"
  | "SHIPPO_FROM_STREET1"
  | "SHIPPO_FROM_STREET2"
>;

const { env } = require("../../lib/env") as { env: ShippoFromEnv };

const defaultBrandAddress = {
  city: "New York",
  country: "US",
  email: "ops@vaivae.com",
  name: "vaivae Fulfillment",
  phone: "+15555550100",
  state: "NY",
  street1: "123 Garment District",
  zip: "10018",
} as const;

function optionalTrimmed(value: string | undefined): string | undefined {
  const trimmed = value?.trim();

  return trimmed ? trimmed : undefined;
}

function withOptionalAddressFields(
  address: AddressCreateRequest,
  fields: Pick<AddressCreateRequest, "company" | "email" | "phone" | "street2">,
): AddressCreateRequest {
  return {
    ...address,
    ...(fields.company ? { company: fields.company } : {}),
    ...(fields.email ? { email: fields.email } : {}),
    ...(fields.phone ? { phone: fields.phone } : {}),
    ...(fields.street2 ? { street2: fields.street2 } : {}),
  };
}

function getShippoBrandAddress(): AddressCreateRequest {
  const address: AddressCreateRequest = {
    city: optionalTrimmed(env.SHIPPO_FROM_CITY) ?? defaultBrandAddress.city,
    country: (
      optionalTrimmed(env.SHIPPO_FROM_COUNTRY_CODE) ?? defaultBrandAddress.country
    ).toUpperCase(),
    name: optionalTrimmed(env.SHIPPO_FROM_NAME) ?? defaultBrandAddress.name,
    state: (optionalTrimmed(env.SHIPPO_FROM_STATE) ?? defaultBrandAddress.state).toUpperCase(),
    street1: optionalTrimmed(env.SHIPPO_FROM_STREET1) ?? defaultBrandAddress.street1,
    zip: optionalTrimmed(env.SHIPPO_FROM_POSTAL_CODE) ?? defaultBrandAddress.zip,
  };

  return withOptionalAddressFields(address, {
    company: optionalTrimmed(env.SHIPPO_FROM_COMPANY),
    email: optionalTrimmed(env.SHIPPO_FROM_EMAIL) ?? defaultBrandAddress.email,
    phone: optionalTrimmed(env.SHIPPO_FROM_PHONE) ?? defaultBrandAddress.phone,
    street2: optionalTrimmed(env.SHIPPO_FROM_STREET2),
  });
}

module.exports = {
  getShippoBrandAddress,
};
