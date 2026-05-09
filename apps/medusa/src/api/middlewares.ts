import type * as MedusaHttp from "@medusajs/framework/http";

const { defineMiddlewares } = require("@medusajs/framework/http") as typeof MedusaHttp;

const middlewares = defineMiddlewares({
  routes: [
    {
      bodyParser: { preserveRawBody: true },
      matcher: "/store/hooks/klaviyo",
      method: ["POST"],
    },
  ],
});

export = middlewares;
