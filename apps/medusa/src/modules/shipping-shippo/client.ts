import type { Shippo as ShippoClient } from "shippo";
import type * as ShippoModule from "shippo";
import type { MedusaEnv } from "../../lib/env";

const { Shippo } = require("shippo") as typeof ShippoModule;
const { env } = require("../../lib/env") as { env: Pick<MedusaEnv, "SHIPPO_API_KEY"> };

function createShippoClient(apiKey = env.SHIPPO_API_KEY): ShippoClient {
  if (!apiKey) {
    throw new Error("SHIPPO_API_KEY is required to purchase Shippo labels.");
  }

  return new Shippo({ apiKeyHeader: apiKey });
}

module.exports = {
  createShippoClient,
};
