import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StarRating } from "../StarRating";

describe("StarRating", () => {
  it("renders five stars", () => {
    render(<StarRating value={0} />);
    expect(screen.getAllByRole("button")).toHaveLength(5);
  });

  it("calls onChange with the selected star value", async () => {
    const onChange = vi.fn();
    render(<StarRating value={0} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText("Rate 3 out of 5"));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("does not call onChange when readonly", async () => {
    const onChange = vi.fn();
    render(<StarRating value={4} onChange={onChange} readonly />);
    await userEvent.click(screen.getByLabelText("Rate 5 out of 5"));
    expect(onChange).not.toHaveBeenCalled();
  });
});
