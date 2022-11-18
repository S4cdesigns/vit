import { describe, it, expect } from "vitest";

import { isBoolean, isNumber } from "./types";

describe("utils", () => {
  it("isNumber", async () => {
    expect(isNumber(5)).to.be.true;
    expect(isNumber(true)).to.be.false;
    expect(isNumber("str")).to.be.false;
  });

  it("isBoolean", async () => {
    expect(isBoolean(false)).to.be.true;
    expect(isBoolean("str")).to.be.false;
    expect(isBoolean(4)).to.be.false;
  });
});
