import { describe, expect, it } from "vitest";
import { getEnv } from "../config/env.ts";

describe("environment bindings", () => {
  it("reads a configured Workers binding", () => {
    expect(getEnv({ API_KEY: "configured" }, "API_KEY")).toBe("configured");
  });

  it("returns undefined for an absent binding", () => {
    expect(getEnv({}, "MISSING_KEY")).toBeUndefined();
    expect(getEnv(undefined, "MISSING_KEY")).toBeUndefined();
  });
});
