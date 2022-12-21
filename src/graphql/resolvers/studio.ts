import { IzzyContext } from "../../middlewares/apollo";
import Actor from "../../types/actor";
import CustomField, { CustomFieldTarget } from "../../types/custom_field";
import Image from "../../types/image";
import Label from "../../types/label";
import Movie from "../../types/movie";
import Scene from "../../types/scene";
import Studio from "../../types/studio";

export default {
  aliases(studio: Studio): string[] {
    return studio.aliases || [];
  },
  rating(studio: Studio): number {
    return studio.rating || 0;
  },
  async averageRating(studio: Studio): Promise<number> {
    return await Studio.getAverageRating(studio);
  },
  thumbnail(studio: Studio, _: any, context: IzzyContext): Promise<Image | null> | null {
    if (studio.thumbnail) {
      return context.studioDataSource.getThumbnailForStudio(studio.thumbnail);
    }
    return null;
  },
  scenes(studio: Studio): Promise<Scene[]> {
    return Studio.getScenes(studio);
  },
  async actors(studio: Studio): Promise<Actor[]> {
    const actors = await Studio.getActors(studio);
    return actors.sort((a, b) => a.name.localeCompare(b.name));
  },
  async labels(studio: Studio, _: any, context: IzzyContext): Promise<Label[]> {
    const labels = await context.studioDataSource.getLabelsForStudio(studio);
    return labels.sort((a, b) => a.name.localeCompare(b.name));
  },
  movies(studio: Studio): Promise<Movie[]> {
    return Studio.getMovies(studio);
  },
  async parent(studio: Studio): Promise<Studio | null> {
    if (studio.parent) {
      return await Studio.getById(studio.parent);
    }
    return null;
  },
  async substudios(studio: Studio): Promise<Studio[]> {
    return Studio.getSubStudios(studio._id);
  },
  async numScenes(studio: Studio, _: any, context: IzzyContext): Promise<number> {
    return context.studioDataSource.getNumScenes(studio);
  },
  async availableFields(): Promise<CustomField[]> {
    const fields = await CustomField.getAll();
    return fields.filter((field) => field.target.includes(CustomFieldTarget.STUDIOS));
  },
};
