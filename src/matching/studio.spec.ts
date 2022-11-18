import { describe, it, expect, beforeAll, afterAll } from "vitest";

import { ensureIndices } from "../search";
import { loadTestConfig } from "../../test/config";
import { collections, loadStores } from "../database";
import Studio from "../types/studio";
import { extractStudios } from "../extractor";

describe("matching", () => {
  beforeAll(async () => {
    loadTestConfig();
    await loadStores();
  });

  describe("studio matching", () => {
    const vixen = new Studio("VIXEN");
    const blacked = new Studio("BLACKED");
    const vixenNetwork = new Studio("VIXEN Media Group");

    beforeAll(async () => {
      await ensureIndices(true);
      await collections.studios.upsert(vixen._id, vixen);
      await collections.studios.upsert(blacked._id, blacked);
      await collections.studios.upsert(vixenNetwork._id, vixenNetwork);
      expect(await collections.studios.count()).to.equal(3);
    });

    afterAll(async () => {
      await collections.studios.remove(vixen._id);
      await collections.studios.remove(blacked._id);
      await collections.studios.remove(vixenNetwork._id);
    });

    it("Should correctly match studios", async () => {
      const matches = await extractStudios(
        "/videos/Networks/VIXEN Media Group/BLACKED/BLACKED - S2018E0520 - Alina Lopez - Side Chick Games 2.mp4"
      );
      expect(matches[0]).to.equal(blacked._id);
    });

    it("Should correctly match even with praent studio", async () => {
      vixen.parent = vixenNetwork._id;
      blacked.parent = vixenNetwork._id;
      await collections.studios.upsert(vixen._id, vixen);
      await collections.studios.upsert(blacked._id, blacked);

      expect(await collections.studios.count()).to.equal(3);
      expect((await Studio.getSubStudios(vixenNetwork._id)).length).to.equal(2);

      const matches = await extractStudios(
        "/videos/Networks/VIXEN Media Group/BLACKED/BLACKED - S2018E0520 - Alina Lopez - Side Chick Games 2.mp4"
      );
      expect(matches[0]).to.equal(blacked._id);
    });
  });
});
