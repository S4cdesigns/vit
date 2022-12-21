import DataLoader from "dataloader";

import Actor from "../../types/actor";
import ActorReference from "../../types/actor_reference";
import Scene from "../../types/scene";
import SceneView from "../../types/watch";
import { logger } from "../../utils/logger";
import { BatchImageLoader, BatchLabelLoader } from "./loaders";

export class SceneDataSource {
  private batchActors = new DataLoader(async (sceneIds: readonly string[]) => {
    if (sceneIds.length === 0) {
      return [];
    }
    logger.silly(`loading actors for scenes [${sceneIds.length}]`);
    const allRefs = await ActorReference.getByItemBulk(sceneIds);

    if (!allRefs) {
      return [];
    }

    logger.silly(`Loaded [${Object.keys(allRefs).length}] actors`);

    let allActors: Actor[] = [];

    const allActorIds = Object.values(allRefs)
      .flatMap((refs) => refs)
      .map((actorRef) => actorRef.actor);

    allActors = await Actor.getBulk(allActorIds);

    return sceneIds.map(async (sceneId) => {
      const actorRefs = allRefs[sceneId];

      if (!actorRefs) {
        // no actors for that scene
        return [];
      }

      return actorRefs.map((ref) => allActors.find((actor) => actor._id === ref.actor)) as Actor[];
    });
  });

  private batchLabels = BatchLabelLoader;
  private batchImages = BatchImageLoader;

  private batchSceneViews = new DataLoader(async (sceneIds: readonly string[]) => {
    if (sceneIds.length === 0) {
      return [];
    }

    const views = await SceneView.getBySceneBulk(sceneIds.concat());

    return sceneIds.map((sceneId) => {
      const view = views[sceneId];

      if (!view) {
        return [];
      }
      return view.map((view) => view.date);
    });
  });

  async getActorsForScene(scene: Scene): Promise<Actor[]> {
    return this.batchActors.load(scene._id);
  }

  async getLabelsForScene(scene: Scene) {
    return this.batchLabels.load(scene._id);
  }

  async getThumbnailForScene(scene: Scene) {
    if (!scene.thumbnail) {
      return;
    }
    return this.batchImages.load(scene.thumbnail);
  }

  async getWatchesForScene(scene: Scene) {
    return this.batchSceneViews.load(scene._id);
  }
}
