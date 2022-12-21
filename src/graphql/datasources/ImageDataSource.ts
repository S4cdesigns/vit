import DataLoader from "dataloader";

import { collections } from "../../database";
import ActorReference from "../../types/actor_reference";
import Image from "../../types/image";
import Scene from "../../types/scene";
import { BatchLabelLoader } from "./loaders";

export class ImageDataSource {
  private batchLabels = BatchLabelLoader;

  private batchScenes = new DataLoader(async (sceneIds: readonly string[]) => {
    const scenes = (await Scene.getBulk(sceneIds)).reduce((acc, current) => {
      return {
        ...acc,
        [current._id]: current,
      };
    }, {}) as { [sceneId: string]: Scene };

    return sceneIds.map((imageId) => {
      if (!scenes[imageId]) {
        return null;
      }

      return scenes[imageId];
    });
  });

  private batchActors = new DataLoader(async (imageIds: readonly string[]) => {
    const allActorRefs = await ActorReference.getByItemBulk(imageIds);

    const actorids = Object.values(allActorRefs)
      .flatMap((refs) => refs)
      .map((ref) => ref.actor);
    const allActors = await collections.actors.getBulk(actorids);

    return imageIds.map((imageId) => {
      if (!allActorRefs[imageId]) {
        return [];
      }

      const imageActorIds = Object.values(
        allActorRefs[imageId].flatMap((refs) => refs).map((ref) => ref.actor)
      );
      return allActors.filter((actor) => imageActorIds.indexOf(actor._id) > -1);
    });
  });

  async getActorsForimage(image: Image) {
    return this.batchActors.load(image._id);
  }

  async getLabelsForimage(image: Image) {
    return this.batchLabels.load(image._id);
  }

  async getSceneForimage(sceneId: string) {
    return this.batchScenes.load(sceneId);
  }
}
