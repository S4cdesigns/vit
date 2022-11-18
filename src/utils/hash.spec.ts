import { describe, it, expect } from "vitest";

import { randomString } from "./hash";

describe("utils", () => {
  it("randomString", () => {
    expect(randomString()).to.be.a("string").with.length(8);
    expect(randomString(35)).to.be.a("string").with.length(35);
  });
});
