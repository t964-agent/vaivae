import MedusaUtils = require("@medusajs/framework/utils");
import SanitySyncService = require("./service");

const { Module } = MedusaUtils;

const SANITY_SYNC_MODULE = "sanity_sync";

const sanitySyncModule = Module(SANITY_SYNC_MODULE, {
  service: SanitySyncService,
});

const exportedModule = {
  default: sanitySyncModule,
  linkable: sanitySyncModule.linkable,
  SANITY_SYNC_MODULE,
};

export = exportedModule;
