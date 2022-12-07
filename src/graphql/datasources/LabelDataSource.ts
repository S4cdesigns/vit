import DataLoader from "dataloader";

import Label from "../../types/label";
import LabelledItem from "../../types/labelled_item";
import Scene from "../../types/scene";
import { logger } from "../../utils/logger";

export class LabelDataSource {
  private batchlLabels = new DataLoader(async (sceneIds: readonly string[]) => {
    logger.info(`loading labels for scenes [${sceneIds.join(",")}]`);
    return sceneIds.map(async (sceneId) => {
      logger.info(`resolving labels for sceneId ${sceneId}`);
      // here we would need a queryBulk method to retrieve all actors for a set of scenes in one request
      const references = await LabelledItem.getByItem(sceneId);
      const refs = await Promise.all(references);
      const labelIds = refs.map((labelRef) => labelRef.label);
      logger.info(`got labelIds [${labelIds.join(",")}] for scene ${sceneId}`);
      return await Label.getBulk(labelIds);
    });
  });

  async getLabelsForScene(scene: Scene) {
    return this.batchlLabels.load(scene._id);
  }
}
