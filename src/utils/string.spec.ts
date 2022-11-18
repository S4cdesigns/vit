import { describe, it, expect } from "vitest";

import urlFixture from "./__fixture/url.fixture";
import extFixture from "./__fixture/ext.fixture";
import removeExtFixture from "./__fixture/rm_ext.fixture";

import { extensionFromUrl, getExtension, removeExtension } from "./string";

describe("utils", () => {
  describe("string", () => {
    describe("Parse URL file extension", () => {
      for (const test of urlFixture) {
        it(`Should get ${test[1]} from ${test[0]}`, async () => {
          expect(extensionFromUrl(test[0])).to.equal(test[1]);
        });
      }
    });

    describe("getExtension", () => {
      for (const test of extFixture) {
        it(`Should extract "${test[1]}" from "${test[0]}"`, () => {
          expect(getExtension(test[0])).equals(test[1]);
        });
      }
    });

    describe("removeExtension", () => {
      for (const test of removeExtFixture) {
        it("Should work as expected", () => {
          expect(removeExtension(test[0])).equals(test[1]);
        });
      }
    });
  });
});
