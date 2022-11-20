import { describe, it, expect, beforeAll, afterAll } from "vitest";

import { ensureIndices } from ".";
import { loadTestConfig } from "../../test/config";
import { collections, loadStores } from "../database";
import Scene from "../types/scene";
import { indexScenes, searchScenes } from "./scene";

describe("search", () => {
  beforeAll(async () => {
    loadTestConfig();
    await loadStores();
  });

  describe("scenes", () => {
    const scene = new Scene("Ginebra Bellucci - Outdoor Anal Action");

    beforeAll(async () => {
      await ensureIndices(true);
      expect(await Scene.getAll()).to.be.empty;
      await collections.scenes.upsert(scene._id, scene);
      await indexScenes([scene]);
      expect(await Scene.getAll()).to.have.lengthOf(1);
    });

    afterAll(async () => {
      await collections.scenes.remove(scene._id);
    });

    it("Should find scene by name", async () => {
      const searchResult = await searchScenes({
        query: "ginebra",
      });
      expect(searchResult).to.deep.equal({
        items: [scene._id],
        total: 1,
        numPages: 1,
      });
    });

    it("Should not find scene with bad query", async () => {
      const searchResult = await searchScenes({
        query: "asdva35aeb5se5b",
      });
      expect(searchResult).to.deep.equal({
        items: [],
        total: 0,
        numPages: 0,
      });
    });
  });

  describe("scenes underscored", () => {
    const scene = new Scene("Ginebra_Bellucci - Outdoor_Anal_Action");

    beforeAll(async () => {
      await ensureIndices(true);
      expect(await Scene.getAll()).to.be.empty;
      await collections.scenes.upsert(scene._id, scene);
      await indexScenes([scene]);
      expect(await Scene.getAll()).to.have.lengthOf(1);
    });

    afterAll(async () => {
      await collections.scenes.remove(scene._id);
    });

    it("Should find scene by name with underscores", async () => {
      const searchResult = await searchScenes({
        query: "ginebra",
      });
      expect(searchResult).to.deep.equal({
        items: [scene._id],
        total: 1,
        numPages: 1,
      });
    });
  });

  describe("scenes dotted", () => {
    const scene = new Scene("Ginebra.Bellucci - Outdoor.Anal.Action");

    beforeAll(async () => {
      await ensureIndices(true);
      expect(await Scene.getAll()).to.be.empty;
      await collections.scenes.upsert(scene._id, scene);
      await indexScenes([scene]);
      expect(await Scene.getAll()).to.have.lengthOf(1);
    });

    afterAll(async () => {
      await collections.scenes.remove(scene._id);
    });

    it("Should find scene by name with dots", async () => {
      const searchResult = await searchScenes({
        query: "ginebra",
      });
      expect(searchResult).to.deep.equal({
        items: [scene._id],
        total: 1,
        numPages: 1,
      });
    });
  });
});
