import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./button";

describe("Button", () => {
  it("renders the requested visual variant and default button type", () => {
    // Arrange / Act
    render(
      <Button size="sm" tone="on-dark" variant="ghost">
        Open atelier
      </Button>,
    );

    // Assert
    const button = screen.getByRole("button", { name: "Open atelier" });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveAttribute("data-size", "sm");
    expect(button).toHaveAttribute("data-tone", "on-dark");
    expect(button).toHaveAttribute("data-variant", "ghost");
    expect(button).toHaveClass("h-9", "border-on-dark/25");
  });

  it("calls the click handler for enabled buttons", async () => {
    // Arrange
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Add to bag</Button>);

    // Act
    await user.click(screen.getByRole("button", { name: "Add to bag" }));

    // Assert
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("disables interaction while loading", async () => {
    // Arrange
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <Button loading onClick={handleClick}>
        Save changes
      </Button>,
    );

    // Act
    const button = screen.getByRole("button", { name: "Loading" });
    await user.click(button);

    // Assert
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
    expect(handleClick).not.toHaveBeenCalled();
  });
});
