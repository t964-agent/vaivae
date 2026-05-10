import { describe, expect, it } from "vitest";

import { formatPrice } from "./format";

describe("formatPrice", () => {
  it("formats cent amounts in the requested currency", () => {
    // Arrange / Act
    const formatted = formatPrice(118000, "usd");

    // Assert
    expect(formatted).toBe("$1,180.00");
  });

  it("honors Intl number-format overrides", () => {
    // Arrange / Act
    const formatted = formatPrice(118000, "usd", { maximumFractionDigits: 0 });

    // Assert
    expect(formatted).toBe("$1,180");
  });
});
