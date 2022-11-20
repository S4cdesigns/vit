import { describe, it, expect } from "vitest";

import { isAbsolute, resolve } from "path";

import tests from "./__fixture/walk.fixture";

import { walk } from "./walk";

describe("Walk folders", () => {
  for (const test of tests) {
    it("Should do correct folder walk", async () => {
      let numFound = 0;

      await walk({
        dir: test.path,
        exclude: test.exclude,
        extensions: test.extensions,
        cb: async (path) => {
          numFound++;
          expect(isAbsolute(path)).to.be.true;
        },
        include: [],
      });

      expect(test.expected.num).to.equal(numFound);
    });
  }

  describe("acts as find", () => {
    for (const value of [true, {}, []]) {
      it(`stops after first call, when cb returns ${JSON.stringify(value)}`, async () => {
        let cbCallCount = 0;

        const res = await walk({
          dir: resolve(__dirname, "__fixture/files"),
          exclude: [],
          extensions: [".jpg"],
          cb: async (path) => {
            cbCallCount++;
            return value;
          },
          include: [],
        });

        expect(cbCallCount).to.equal(1);
        expect(res).to.be.a("string");
      });
    }
    for (const value of [false, null, undefined, 0, "", Number.NaN]) {
      it(`does NOT stop after first call, when cb returns "${value}"`, async () => {
        let cbCallCount = 0;

        const res = await walk({
          dir: resolve(__dirname, "__fixture/files"),
          exclude: [],
          extensions: [".jpg"],
          cb: async (path) => {
            cbCallCount++;
            return value;
          },
          include: [],
        });

        expect(cbCallCount).to.be.greaterThan(1);
        expect(res).to.be.undefined;
      });
    }
  });
});
