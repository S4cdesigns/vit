import { describe, it, expect, beforeAll, afterAll } from "vitest";

import { ensureIndices } from ".";
import { loadTestConfig } from "../../test/config";
import { collections, loadStores } from "../database";
import Studio from "../types/studio";
import { indexStudios, searchStudios } from "./studio";

describe("search", () => {
  beforeAll(async () => {
    loadTestConfig();
    await loadStores();
  });

  describe("studios", () => {
    const studio = new Studio("TUSHY");

    beforeAll(async () => {
      await ensureIndices(true);
      expect(await Studio.getAll()).to.be.empty;
      await collections.studios.upsert(studio._id, studio);
      await indexStudios([studio]);
      expect(await Studio.getAll()).to.have.lengthOf(1);
    });

    afterAll(async () => {
      await collections.studios.remove(studio._id);
    });

    it("Should find studio by name", async () => {
      const searchResult = await searchStudios({
        query: "tushy",
      });
      expect(searchResult).to.deep.equal({
        items: [studio._id],
        total: 1,
        numPages: 1,
      });
    });

    it("Should not find studio with bad query", async () => {
      const searchResult = await searchStudios({
        query: "asdva35aeb5se5b",
      });
      expect(searchResult).to.deep.equal({
        items: [],
        total: 0,
        numPages: 0,
      });
    });
  });

  describe("studios underscored", () => {
    const studio = new Studio("TUSHY_RAW");

    beforeAll(async () => {
      await ensureIndices(true);
      expect(await Studio.getAll()).to.be.empty;
      await collections.studios.upsert(studio._id, studio);
      await indexStudios([studio]);
      expect(await Studio.getAll()).to.have.lengthOf(1);
    });

    afterAll(async () => {
      await collections.studios.remove(studio._id);
    });

    it("Should find studio by name with underscores", async () => {
      const searchResult = await searchStudios({
        query: "tushy",
      });
      expect(searchResult).to.deep.equal({
        items: [studio._id],
        total: 1,
        numPages: 1,
      });
    });
  });

  describe("studios dotted", () => {
    const studio = new Studio("Ginebra.Bellucci");

    beforeAll(async () => {
      await ensureIndices(true);
      expect(await Studio.getAll()).to.be.empty;
      await collections.studios.upsert(studio._id, studio);
      await indexStudios([studio]);
      expect(await Studio.getAll()).to.have.lengthOf(1);
    });

    afterAll(async () => {
      await collections.studios.remove(studio._id);
    });

    it("Should find studio by name with dots", async () => {
      const searchResult = await searchStudios({
        query: "ginebra",
      });
      expect(searchResult).to.deep.equal({
        items: [studio._id],
        total: 1,
        numPages: 1,
      });
    });
  });
});
