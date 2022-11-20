import { describe, it, expect } from "vitest";

import stripStrFixtures from "./__fixture/stringMatcher/strip_string.fixture";
import filterFixtures from "./__fixture/stringMatcher/filter_items.fixture";
import matchingActorFixtures from "./__fixture/stringMatcher/matching_actor.fixture";
import matchingLabelFixtures from "./__fixture/stringMatcher/matching_label.fixture";

import { StringMatcher, stripStr } from "./stringMatcher";

describe("matching", () => {
  describe("String matcher", () => {
    describe("Strip string", () => {
      for (const test of stripStrFixtures) {
        it("Should work as expected", () => {
          expect(stripStr(test.source, "[^a-zA-Z0-9'/\\,()[\\]{}-]")).equals(test.expected);
        });
      }
    });

    describe("filterMatchingItems", () => {
      for (const test of filterFixtures) {
        it(`${test.name}`, () => {
          const res = new StringMatcher({
            ignoreSingleNames: test.options.ignoreSingleNames,
            stripString: "[^a-zA-Z0-9'/\\,()[\\]{}-]",
          })
            .filterMatchingItems(
              test.items,
              test.str,
              (item) => [item.name],
              test.options.sortByLongestMatch
            )
            .map((item) => item.name);
          expect(res).to.deep.equal(test.expected);
        });
      }
    });

    describe("Is matching actor", () => {
      for (const test of matchingActorFixtures) {
        it(`Should ${test.expected ? "" : "not "}match ${test.actor.name}`, () => {
          const isMatch = new StringMatcher({
            ignoreSingleNames: true,
            stripString: "[^a-zA-Z0-9'/\\,()[\\]{}-]",
          }).isMatchingItem(test.actor, test.str, (actor) => [actor.name, ...actor.aliases]);
          expect(isMatch).to.equal(test.expected);
        });
      }
    });

    describe("Is matching label", () => {
      for (const test of matchingLabelFixtures) {
        it(`Should ${test.expected ? "" : "not "}match ${test.label.name}`, () => {
          const isMatch = new StringMatcher({
            ignoreSingleNames: false,
            stripString: "[^a-zA-Z0-9'/\\,()[\\]{}-]",
          }).isMatchingItem(test.label, test.str, (label) => [label.name, ...label.aliases]);
          expect(isMatch).to.equal(test.expected);
        });
      }
    });
  });
});
