import MedusaUtils = require("@medusajs/framework/utils");
import KlaviyoService = require("./service");

const { Module } = MedusaUtils;

const KLAVIYO_MODULE = "klaviyo";

const klaviyoModule = Module(KLAVIYO_MODULE, {
  service: KlaviyoService,
});

const exportedModule = {
  default: klaviyoModule,
  linkable: klaviyoModule.linkable,
  KLAVIYO_MODULE,
};

export = exportedModule;
