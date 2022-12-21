import Marker from "../../types/marker";
import { BatchActorLoader, BatchImageLoader, BatchLabelLoader } from "./loaders";

export class MarkerDataSource {
  private batchActors = BatchActorLoader;
  private batchLabels = BatchLabelLoader;
  private batchImages = BatchImageLoader;

  async getActorsForMarker(marker: Marker) {
    return this.batchActors.load(marker._id);
  }

  async getLabelsForMarker(marker: Marker) {
    return this.batchLabels.load(marker._id);
  }

  async getThumbnailForMarker(thumbId: string) {
    return this.batchImages.load(thumbId);
  }
}
