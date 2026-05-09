import MedusaMigrations = require("@medusajs/framework/mikro-orm/migrations");

const { Migration } = MedusaMigrations;

class Migration20260509120000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table if not exists "consent_record" ("id" text not null, "customer_id" text not null, "subscribed" boolean not null, "source" text null, "ip_address" text null, "user_agent" text null, "email" text not null, "marketing_email_lists" jsonb null, "opt_out_reason" text null, "double_opt_in_at" timestamptz null, "consented_at" timestamptz not null, "expires_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "consent_record_pkey" primary key ("id"));`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_CONSENT_RECORD_CUSTOMER_ID" ON "consent_record" (customer_id) WHERE deleted_at IS NULL;`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_CONSENT_RECORD_EMAIL" ON "consent_record" (email) WHERE deleted_at IS NULL;`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_CONSENT_RECORD_CONSENTED_AT" ON "consent_record" (consented_at) WHERE deleted_at IS NULL;`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_CONSENT_RECORD_CUSTOMER_CURRENT" ON "consent_record" (customer_id, consented_at) WHERE deleted_at IS NULL;`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_CONSENT_RECORD_EXPIRES_AT" ON "consent_record" (expires_at) WHERE deleted_at IS NULL;`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_consent_record_deleted_at" ON "consent_record" (deleted_at) WHERE deleted_at IS NULL;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "consent_record" cascade;`);
  }
}

module.exports.Migration20260509120000 = Migration20260509120000;
