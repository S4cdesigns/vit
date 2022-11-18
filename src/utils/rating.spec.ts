import { describe, it, expect } from "vitest";

import { validRating } from "./misc";

describe("utils", () => {
  it("validRating", async () => {
    expect(validRating(5)).to.be.true;
    expect(validRating(true)).to.be.false;
    expect(validRating("str")).to.be.false;
    expect(validRating(0)).to.be.true;
    expect(validRating(10)).to.be.true;
    expect(validRating(5.6)).to.be.false;
    expect(validRating(-5)).to.be.false;
    expect(validRating(15)).to.be.false;
  });
});
