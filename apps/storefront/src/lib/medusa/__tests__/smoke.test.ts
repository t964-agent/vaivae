import type { getDefaultRegion } from "@/medusa/regions";
import type { StoreRegion } from "@/medusa/types";

import { expectTypeOf, test } from "vitest";

test("getDefaultRegion resolves to a StoreRegion type", () => {
  expectTypeOf<Awaited<ReturnType<typeof getDefaultRegion>>>().toMatchTypeOf<StoreRegion>();
});
