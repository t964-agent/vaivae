import type * as NodeFs from "node:fs";
import type * as NodePath from "node:path";

const fs = require("node:fs") as typeof NodeFs;
const path = require("node:path") as typeof NodePath;

const medusaPackagePath = require.resolve("@medusajs/medusa/package.json") as string;
const promotionFilterPath = path.resolve(
  path.dirname(medusaPackagePath),
  "..",
  "promotion",
  "dist",
  "utils",
  "compute-actions",
  "build-promotion-rule-query-filter-from-context.js",
);

const original = `    // Handle the case where context has no attributes at all, it means
    // that any promotion that have a rule cant be satisfied by the context
    if (attributeValueMap.size === 0) {
        // If context has no attributes, exclude all promotions that have any rules (promotion rules, target rules, or buy rules)
        const noRulesSubquery = (alias) => \`
      \${alias}.id NOT IN (
        SELECT DISTINCT ppr.promotion_id
        FROM promotion_promotion_rule ppr
        UNION
        SELECT DISTINCT am.promotion_id
        FROM promotion_application_method am
        JOIN application_method_target_rules amtr ON am.id = amtr.application_method_id
        UNION
        SELECT DISTINCT am2.promotion_id
        FROM promotion_application_method am2
        JOIN application_method_buy_rules ambr ON am2.id = ambr.application_method_id
      )
    \`.trim();
        return {
            [(0, postgresql_1.raw)((alias) => noRulesSubquery(alias))]: true,
        };
    }`;

const replacement = `    // Handle the case where context has no attributes at all, it means
    // no rule prefilter can be safely expressed. Medusa 2.14.2's raw SQL
    // filter is mis-escaped by MikroORM on PostgreSQL in this path.
    if (attributeValueMap.size === 0) {
        return null;
    }`;

const contents = fs.readFileSync(promotionFilterPath, "utf8");

if (contents.includes(replacement)) {
  console.log("@medusajs/promotion cart prefilter patch already applied.");
} else if (contents.includes(original)) {
  fs.writeFileSync(promotionFilterPath, contents.replace(original, replacement));
  console.log("Applied @medusajs/promotion cart prefilter patch.");
} else {
  throw new Error(`Could not find expected @medusajs/promotion block in ${promotionFilterPath}`);
}
