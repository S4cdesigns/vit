import Actor from "../../types/actor";
import Image from "../../types/image";
import Label from "../../types/label";
import { BatchImageLoader, BatchLabelLoader } from "./loaders";

export class ActorDataSource {
  private batchImages = BatchImageLoader;
  private batchLabels = BatchLabelLoader;

  async getLabelsForActor(actor: Actor): Promise<Label[]> {
    return this.batchLabels.load(actor._id);
  }

  async getAvatarForActor(actor: Actor): Promise<Image | null> {
    if (!actor.avatar) {
      return null;
    }
    return this.batchImages.load(actor.avatar);
  }



  async getThumbnailForActor(actor: Actor) {
    if (!actor.thumbnail) {
      return null;
    }
    return this.batchImages.load(actor.thumbnail);
  }

  async getAltThumbnailForActor(actor: Actor) {
    if (!actor.altThumbnail) {
      return null;
    }
    return this.batchImages.load(actor.altThumbnail);
  }
}
