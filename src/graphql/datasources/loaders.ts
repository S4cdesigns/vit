import DataLoader from "dataloader";

import Actor from "../../types/actor";
import ActorReference from "../../types/actor_reference";
import Image from "../../types/image";
import Label from "../../types/label";
import LabelledItem from "../../types/labelled_item";
import { logger } from "../../utils/logger";

export const BatchImageLoader = new DataLoader(async (imageIds: readonly string[]) => {
  if (imageIds.length === 0) {
    return [];
  }
  logger.silly(`loading bulk images for imageIds [${imageIds.length}]`);
  return await Image.getBulk(imageIds.concat());
});

export const BatchLabelLoader = new DataLoader(async (itemIds: readonly string[]) => {
  logger.silly(`loading labels for items [${itemIds.join(",")}]`);
  const allItemLabels = await LabelledItem.getByItemBulk(itemIds);

  let allLabels: Label[] = [];

  const allLabelIds = Object.values(allItemLabels)

    .flatMap((refs) => refs)
    .map((labelRef) => labelRef.label);

  allLabels = await Label.getBulk(allLabelIds);

  return itemIds.map(async (itemId) => {
    const labelRefs = allItemLabels[itemId];

    if (!labelRefs) {
      // no labels for that item
      return [];
    }

    const actors = labelRefs.map((ref) =>
      allLabels.find((label) => label._id === ref.label)
    ) as Label[];
    return actors;
  });
});

export const BatchActorLoader = new DataLoader(async (itemIds: readonly string[]) => {
  if (itemIds.length === 0) {
    return [];
  }
  logger.silly(`loading actors for items [${itemIds.length}]`);
  const allRefs = await ActorReference.getByItemBulk(itemIds);

  if (!allRefs) {
    return [];
  }

  logger.silly(`Loaded [${Object.keys(allRefs).length}] actors`);

  let allActors: Actor[] = [];

  const allActorIds = Object.values(allRefs)
    .flatMap((refs) => refs)
    .map((actorRef) => actorRef.actor);

  allActors = await Actor.getBulk(allActorIds);

  return itemIds.map(async (itemIds) => {
    const actorRefs = allRefs[itemIds];

    if (!actorRefs) {
      // no actors for that item
      return [];
    }

    return actorRefs.map((ref) => allActors.find((actor) => actor._id === ref.actor)) as Actor[];
  });
});
