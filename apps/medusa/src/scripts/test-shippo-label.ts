import type { ExecArgs } from "@medusajs/framework/types";
import type * as MedusaUtils from "@medusajs/framework/utils";
import type { AddressCreateRequest, ParcelCreateRequest } from "shippo";
import ShippingShippoModule = require("../modules/shipping-shippo");

const { ContainerRegistrationKeys } = require("@medusajs/framework/utils") as typeof MedusaUtils;
const { SHIPPING_SHIPPO_MODULE } = ShippingShippoModule;

type ShippoBrandAddressModule = {
  getShippoBrandAddress(): AddressCreateRequest;
};

const { getShippoBrandAddress } =
  require("../modules/shipping-shippo/brand-address") as ShippoBrandAddressModule;

type ShippingShippoService = {
  generateLabel(input: {
    shipFromAddress: AddressCreateRequest;
    shipToAddress: AddressCreateRequest;
    parcel: ParcelCreateRequest;
    metadata?: Record<string, string>;
  }): Promise<{
    labelUrl: string;
    rateId: string;
    status: string;
    trackingNumber: string;
    trackingUrlProvider: string;
    transactionId: string;
  }>;
};

const testShipToAddress: AddressCreateRequest = {
  city: "San Francisco",
  country: "US",
  email: "shippo-test@example.com",
  name: "Shippo Test Recipient",
  phone: "+15555550101",
  state: "CA",
  street1: "965 Mission St",
  zip: "94103",
};

const testParcel: ParcelCreateRequest = {
  distanceUnit: "in",
  height: "4",
  length: "12",
  massUnit: "oz",
  weight: "16",
  width: "10",
};

async function testShippoLabel({ container }: ExecArgs): Promise<void> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const service = container.resolve<ShippingShippoService>(SHIPPING_SHIPPO_MODULE);
  const result = await service.generateLabel({
    metadata: {
      source: "smoke_test",
    },
    parcel: testParcel,
    shipFromAddress: getShippoBrandAddress(),
    shipToAddress: testShipToAddress,
  });

  logger.info(
    `Shippo label smoke test completed with transaction ${result.transactionId}, rate ${result.rateId}, tracking ${result.trackingNumber}, label ${result.labelUrl}, tracking URL ${result.trackingUrlProvider}, status ${result.status}. Requires a valid SHIPPO_API_KEY; Shippo test keys are supported.`,
  );
}

module.exports = testShippoLabel;
module.exports.default = testShippoLabel;
