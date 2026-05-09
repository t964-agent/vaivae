import MedusaUtils = require("@medusajs/framework/utils");
import type * as CustomerModuleExports from "@medusajs/medusa/customer";
import MarketingConsentModule = require("../modules/marketing-consent");

const { defineLink } = MedusaUtils;
const customerModuleExports = require("@medusajs/medusa/customer") as typeof CustomerModuleExports;
const CustomerModule = customerModuleExports.default;

const customerMarketingConsentLink = defineLink(
  CustomerModule.linkable["customer"],
  {
    linkable: MarketingConsentModule.linkable["consentRecord"],
    isList: true,
  },
  { readOnly: false },
);

export = customerMarketingConsentLink;
