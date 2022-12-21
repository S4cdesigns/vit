import { IzzyContext } from "../../middlewares/apollo";
import Actor from "../../types/actor";
import Image from "../../types/image";
import Label from "../../types/label";
import Scene from "../../types/scene";
import Studio from "../../types/studio";

export default {
  async actors(image: Image, _: any, context: IzzyContext): Promise<Actor[]> {
    const actors = await context.imageDataSource.getActorsForimage(image);
    return actors.sort((a, b) => a.name.localeCompare(b.name));
  },
  async scene(image: Image): Promise<Scene | null> {
    if (image.scene) return await Scene.getById(image.scene);
    return null;
  },
  async labels(image: Image, _: any, context: IzzyContext): Promise<Label[]> {
    const labels = await context.imageDataSource.getLabelsForimage(image);
    return labels.sort((a, b) => a.name.localeCompare(b.name));
  },
  async studio(image: Image): Promise<Studio | null> {
    if (image.studio) return Studio.getById(image.studio);
    return null;
  },
  color(image: Image): string | null {
    return Image.color(image) || null;
  },
};
