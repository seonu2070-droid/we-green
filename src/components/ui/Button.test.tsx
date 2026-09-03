import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { Button } from "./Button";

describe("Button", () => {
  it("renders as a native button by default", () => {
    render(<Button>클릭</Button>);
    const button = screen.getByRole("button", { name: "클릭" });
    expect(button).toHaveClass("button", "button-primary");
    expect(button).toHaveAttribute("type", "button");
  });

  it("applies variant, size, and wide modifiers", () => {
    render(
      <Button variant="secondary" size="small" wide>
        보조
      </Button>,
    );
    const button = screen.getByRole("button", { name: "보조" });
    expect(button).toHaveClass(
      "button",
      "button-secondary",
      "button-small",
      "button-wide",
    );
  });

  it("fires onClick handlers", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>누르기</Button>);

    await user.click(screen.getByRole("button", { name: "누르기" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("renders as a router Link when as='link'", () => {
    render(
      <MemoryRouter>
        <Button as="link" to="/companies">
          이동
        </Button>
      </MemoryRouter>,
    );
    const link = screen.getByRole("link", { name: "이동" });
    expect(link).toHaveAttribute("href", "/companies");
    expect(link).toHaveClass("button", "button-primary");
  });
});
