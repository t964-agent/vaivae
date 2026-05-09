import MedusaUtils = require("@medusajs/framework/utils");
import ShippingShippoService = require("./service");

const { Module } = MedusaUtils;

const SHIPPING_SHIPPO_MODULE = "shipping_shippo";

const shippingShippoModule = Module(SHIPPING_SHIPPO_MODULE, {
  service: ShippingShippoService,
});

const exportedModule = {
  default: shippingShippoModule,
  linkable: shippingShippoModule.linkable,
  SHIPPING_SHIPPO_MODULE,
};

export = exportedModule;
