import DataLoader from "dataloader";

import Actor from "../../types/actor";
import ActorReference from "../../types/actor_reference";
import Scene from "../../types/scene";
import { logger } from "../../utils/logger";

// TODO: rename to SceneDataSource
export class SceneDataSource {
  private batchActors = new DataLoader(async (sceneIds: readonly string[]) => {
    if (sceneIds.length === 0) {
      console.log("no scenes length");
      return [];
    }
    logger.info(`loading actors for scenes [${sceneIds.length}]`);
    const allRefs = await ActorReference.getByItemBulk(sceneIds);

    if (!allRefs) {
      console.log("no actor refs found");
      return [];
    }

    logger.info(`Loaded [${Object.keys(allRefs).length}] actors`);

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
        console.log(`returning no actors for scene ${sceneId}, has no actors`);
        return [];
      }

      const actors = actorRefs.map((ref) =>
        allActors.find((actor) => actor._id === ref.actor)
      ) as Actor[];
      console.log(`returning ${actors.length} actors for scene ${sceneId}`);
      return actors;
    });
  });

  async getActorsForScene(scene: Scene): Promise<Actor[]> {
    return this.batchActors.load(scene._id);
  }
}
