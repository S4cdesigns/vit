import { describe, it, expect } from "vitest";

import { mergeMissingProperties } from "./misc";

import fixtures from "./__fixture/mergeMissingProperties.fixture";

describe("utils", () => {
  describe("mergeMissingProperties", () => {
    fixtures.forEach((fixture, fixtureIndex) => {
      it(`${fixtureIndex} should only add missing properties`, () => {
        if (fixture.noChange) {
          expect(fixture.target).to.deep.equal(fixture.expected);
        }

        mergeMissingProperties(fixture.target, fixture.defaults, fixture.ignorePaths || []);

        expect(fixture.target).to.deep.equal(fixture.expected);
      });
    });
  });
});
