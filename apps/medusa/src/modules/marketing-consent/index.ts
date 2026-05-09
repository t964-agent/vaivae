import MedusaUtils = require("@medusajs/framework/utils");
import MarketingConsentService = require("./service");

const { Module } = MedusaUtils;

const MARKETING_CONSENT_MODULE = "marketing_consent";

const marketingConsentModule = Module(MARKETING_CONSENT_MODULE, {
  service: MarketingConsentService,
});

const exportedModule = {
  default: marketingConsentModule,
  linkable: marketingConsentModule.linkable,
  MARKETING_CONSENT_MODULE,
};

export = exportedModule;
