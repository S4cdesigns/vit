import { describe, it, expect } from "vitest";

import { removeUnknownProperties } from "./misc";
import fixtures from "./__fixture/removeUnknownProperties.fixture";

describe("utils", () => {
  describe("removeUnknownProperties", () => {
    fixtures.forEach((fixture, fixtureIndex) => {
      it(`${fixtureIndex} should remove unknown properties`, () => {
        if (fixture.noChange) {
          expect(fixture.target).to.deep.equal(fixture.expected);
        }

        removeUnknownProperties(fixture.target, fixture.default, fixture.ignorePaths);

        expect(fixture.target).to.deep.equal(fixture.expected);
      });
    });
  });
});
