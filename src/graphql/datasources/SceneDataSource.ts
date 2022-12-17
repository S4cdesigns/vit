import DataLoader from "dataloader";

import Actor from "../../types/actor";
import ActorReference from "../../types/actor_reference";
import Image from "../../types/image";
import Label from "../../types/label";
import LabelledItem from "../../types/labelled_item";
import Scene from "../../types/scene";
import SceneView from "../../types/watch";
import { logger } from "../../utils/logger";

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

    try {
      const allActorIds = Object.values(allRefs)

        .flatMap((refs) => refs)
        .map((actorRef) => actorRef.actor);

      allActors = await Actor.getBulk(allActorIds);
    } catch (error) {
      // TODO: fallback to Scene.getActors()
      console.error(error);
      console.error(allRefs);
      console.error(sceneIds);
    }

    return sceneIds.map(async (sceneId) => {
      const actorRefs = allRefs[sceneId];

      if (!actorRefs) {
        // no actors for that scene
        return [];
      }

      const actors = actorRefs.map((ref) =>
        allActors.find((actor) => actor._id === ref.actor)
      ) as Actor[];
      return actors;
    });
  });

  private batchlLabels = new DataLoader(async (sceneIds: readonly string[]) => {
    logger.silly(`loading labels for scenes [${sceneIds.join(",")}]`);
    const allSceneLabels = await LabelledItem.getByItemBulk(sceneIds);

    let allLabels: Label[] = [];

    try {
      const allLabelIds = Object.values(allSceneLabels)

        .flatMap((refs) => refs)
        .map((labelRef) => labelRef.label);

      allLabels = await Label.getBulk(allLabelIds);
    } catch (error) {
      // TODO: fallback to Scene.getActors()
      console.error(error);
      console.error(allSceneLabels);
      console.error(sceneIds);
    }

    return sceneIds.map(async (sceneId) => {
      const labelRefs = allSceneLabels[sceneId];

      if (!labelRefs) {
        // no labels for that scene
        return [];
      }

      const actors = labelRefs.map((ref) =>
        allLabels.find((label) => label._id === ref.label)
      ) as Label[];
      return actors;
    });
  });

  private batchImages = new DataLoader(async (imageIds: readonly string[]) => {
    if (imageIds.length === 0) {
      return [];
    }
    logger.silly(`loading bulk images for imageIds [${imageIds.length}]`);
    return await Image.getBulk(imageIds.concat());
  });

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
    return this.batchlLabels.load(scene._id);
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
