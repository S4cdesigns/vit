import DataLoader from "dataloader";

import Scene from "../../types/scene";
import Studio from "../../types/studio";
import { BatchImageLoader, BatchLabelLoader } from "./loaders";

export class StudioDataSource {
  private batchLabels = BatchLabelLoader;
  private batchImages = BatchImageLoader;

  private batchScenes = new DataLoader(async (studioIds: readonly string[]) => {
    const allScenes = await Scene.getByStudios(studioIds);
    const allSubStudios = await Studio.getSubStudiosBulk(studioIds);
    const subStudioIds = Object.values(allSubStudios)
      .flatMap((studios) => studios)
      .map((studio) => studio._id);
    const allSubStudioScenes = await Scene.getByStudios(subStudioIds);

    return studioIds.map((studioId) => {
      if (!allScenes[studioId]) {
        return [];
      }

      const scenes = allScenes[studioId];

      if (!allSubStudios[studioId]) {
        return scenes;
      }

      const subStudioScenes = allSubStudios[studioId]
        .filter((subStudio) => allSubStudioScenes[subStudio._id])
        .flatMap((studio) => allSubStudioScenes[studio._id]);

      return scenes.concat(subStudioScenes);
    });
  });

  async getNumScenes(studio: Studio) {
    return (await this.batchScenes.load(studio._id)).length;
  }

  async getLabelsForStudio(studio: Studio) {
    return await this.batchLabels.load(studio._id);
  }

  async getThumbnailForStudio(thumbnailId: string) {
    return await this.batchImages.load(thumbnailId);
  }
}
