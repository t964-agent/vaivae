import { describe, expect, it } from "vitest";

import { cn } from "./utils";

describe("cn", () => {
  it("merges conditional class values", () => {
    // Arrange / Act
    const className = cn("text-sm", false, null, undefined, ["font-medium"]);

    // Assert
    expect(className).toBe("text-sm font-medium");
  });

  it("deduplicates conflicting Tailwind utilities", () => {
    // Arrange / Act
    const className = cn("px-2 py-1", "px-4");

    // Assert
    expect(className).toBe("py-1 px-4");
  });
});
