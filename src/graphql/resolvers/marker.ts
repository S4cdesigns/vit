import { IzzyContext } from "../../middlewares/apollo";
import Actor from "../../types/actor";
import Image from "../../types/image";
import Label from "../../types/label";
import Marker from "../../types/marker";
import Scene from "../../types/scene";

export default {
  async actors(marker: Marker, _: any, context: IzzyContext): Promise<Actor[]> {
    const actors = await context.markerDataSource.getActorsForMarker(marker);
    return actors.sort((a, b) => a.name.localeCompare(b.name));
  },
  async labels(marker: Marker, _: any, context: IzzyContext): Promise<Label[]> {
    const labels = await context.markerDataSource.getLabelsForMarker(marker);
    return labels.sort((a, b) => a.name.localeCompare(b.name));
  },
  async thumbnail(marker: Marker, _: any, context: IzzyContext): Promise<Image | null> {
    if (marker.thumbnail) {
      return await context.markerDataSource.getThumbnailForMarker(marker.thumbnail);
    }
    return null;
  },
  async scene(marker: Marker): Promise<Scene | null> {
    return Scene.getById(marker.scene);
  },
};
