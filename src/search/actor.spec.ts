import { describe, it, expect, beforeAll, afterAll } from "vitest";

import { ensureIndices } from ".";
import { loadTestConfig } from "../../test/config";
import { collections, loadStores } from "../database";
import Actor from "../types/actor";
import { indexActors, searchActors } from "./actor";

describe("search", () => {
  beforeAll(async () => {
    loadTestConfig();
    await loadStores();
  });

  describe("actors", () => {
    const actor = new Actor("Ginebra Bellucci");

    beforeAll(async () => {
      await ensureIndices(true);
      expect(await Actor.getAll()).to.be.empty;
      await collections.actors.upsert(actor._id, actor);
      await indexActors([actor]);
      expect(await Actor.getAll()).to.have.lengthOf(1);
    });

    afterAll(async () => {
      await collections.actors.remove(actor._id);
    });

    it("Should find actor by name", async () => {
      const searchResult = await searchActors({
        query: "ginebra",
      });
      expect(searchResult).to.deep.equal({
        items: [actor._id],
        total: 1,
        numPages: 1,
      });
    });

    it("Should not find actor with bad query", async () => {
      const searchResult = await searchActors({
        query: "asdva35aeb5se5b",
      });
      expect(searchResult).to.deep.equal({
        items: [],
        total: 0,
        numPages: 0,
      });
    });
  });

  describe("actors underscored", () => {
    const actor = new Actor("Ginebra_Bellucci");

    beforeAll(async () => {
      await ensureIndices(true);
      expect(await Actor.getAll()).to.be.empty;
      await collections.actors.upsert(actor._id, actor);
      await indexActors([actor]);
      expect(await Actor.getAll()).to.have.lengthOf(1);
    });

    afterAll(async () => {
      await collections.actors.remove(actor._id);
    });

    it("Should find actor by name with underscores", async () => {
      const searchResult = await searchActors({
        query: "ginebra",
      });
      expect(searchResult).to.deep.equal({
        items: [actor._id],
        total: 1,
        numPages: 1,
      });
    });
  });

  describe("actors dotted", () => {
    const actor = new Actor("Ginebra.Bellucci");

    beforeAll(async () => {
      await ensureIndices(true);
      expect(await Actor.getAll()).to.be.empty;
      await collections.actors.upsert(actor._id, actor);
      await indexActors([actor]);
      expect(await Actor.getAll()).to.have.lengthOf(1);
    });

    afterAll(async () => {
      await collections.actors.remove(actor._id);
    });

    it("Should find actor by name with dots", async () => {
      const searchResult = await searchActors({
        query: "ginebra",
      });
      expect(searchResult).to.deep.equal({
        items: [actor._id],
        total: 1,
        numPages: 1,
      });
    });
  });
});
