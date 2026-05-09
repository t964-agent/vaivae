import MedusaUtils = require("@medusajs/framework/utils");

const { model } = MedusaUtils;

const ConsentRecord = model
  .define("consent_record", {
    id: model.id({ prefix: "concr" }).primaryKey(),
    customer_id: model.text().index("IDX_CONSENT_RECORD_CUSTOMER_ID"),
    subscribed: model.boolean(),
    source: model.text().nullable(),
    ip_address: model.text().nullable(),
    user_agent: model.text().nullable(),
    email: model.text().index("IDX_CONSENT_RECORD_EMAIL"),
    marketing_email_lists: model.json().nullable(),
    opt_out_reason: model.text().nullable(),
    double_opt_in_at: model.dateTime().nullable(),
    consented_at: model.dateTime().index("IDX_CONSENT_RECORD_CONSENTED_AT"),
    expires_at: model.dateTime().nullable(),
  })
  .indexes([
    {
      name: "IDX_CONSENT_RECORD_CUSTOMER_CURRENT",
      on: ["customer_id", "consented_at"],
    },
    {
      name: "IDX_CONSENT_RECORD_EXPIRES_AT",
      on: ["expires_at"],
    },
  ]);

export = ConsentRecord;
