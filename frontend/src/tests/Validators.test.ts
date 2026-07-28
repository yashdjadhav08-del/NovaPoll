import { pollFormSchema } from "../utils/validators";
import { describe, it, expect } from "vitest";

describe("Poll Validation Schema", () => {
  it("passes valid poll form data", () => {
    const validData = {
      title: "Valid Poll Title Here",
      description: "Detailed description for the poll goes here...",
      category: 0,
      options: ["Option 1", "Option 2"],
      durationDays: 7,
    };
    const result = pollFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("fails if title is too short", () => {
    const invalidData = {
      title: "Hi",
      description: "Detailed description...",
      category: 0,
      options: ["Option 1", "Option 2"],
      durationDays: 7,
    };
    const result = pollFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("fails if fewer than 2 options are provided", () => {
    const invalidData = {
      title: "Valid Title Here",
      description: "Detailed description...",
      category: 0,
      options: ["Only 1 option"],
      durationDays: 7,
    };
    const result = pollFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
