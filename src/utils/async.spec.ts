import { describe, it, expect } from "vitest";

import { mapAsync, filterAsync } from "./async";

describe("utils", () => {
  it("Should map array async", async () => {
    expect(await mapAsync([1, 2, 3, 4, 5], async (num) => num * 2)).to.deep.equal([2, 4, 6, 8, 10]);
  });

  it("Should filter array async", async () => {
    expect(await filterAsync([1, 15, 6, 10, -1], async (num) => num >= 10)).to.deep.equal([15, 10]);
  });
});
