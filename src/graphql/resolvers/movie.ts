import { collections } from "../../database";
import { IzzyContext } from "../../middlewares/apollo";
import Actor from "../../types/actor";
import Image from "../../types/image";
import Label from "../../types/label";
import Movie from "../../types/movie";
import Scene from "../../types/scene";
import Studio from "../../types/studio";

export default {
  async frontCover(movie: Movie): Promise<Image | null> {
    if (!movie.frontCover) {
      return null;
    }

    const image = await Image.getById(movie.frontCover);
    if (!image) {
      return null;
    }

    // Pre 0.27 compatibility: add image dimensions on demand and save to db
    if (Image.addDimensions(image)) {
      await collections.images.upsert(image._id, image);
    }

    return image;
  },

  async backCover(movie: Movie): Promise<Image | null> {
    if (!movie.backCover) {
      return null;
    }
    const image = await Image.getById(movie.backCover);
    if (!image) {
      return null;
    }

    // Pre 0.27 compatibility: add image dimensions on demand and save to db
    if (Image.addDimensions(image)) {
      await collections.images.upsert(image._id, image);
    }

    return image;
  },

  async spineCover(movie: Movie): Promise<Image | null> {
    if (!movie.spineCover) {
      return null;
    }
    const image = await Image.getById(movie.spineCover);
    if (!image) {
      return null;
    }

    // Pre 0.27 compatibility: add image dimensions on demand and save to db
    if (Image.addDimensions(image)) {
      await collections.images.upsert(image._id, image);
    }

    return image;
  },

  async scenes(movie: Movie, _: any, context: IzzyContext): Promise<Scene[]> {
    const movieDataSources = context.movieDataSource;
    return await movieDataSources.getScenesForMovie(movie._id);
  },

  async actors(movie: Movie, _: any, context: IzzyContext): Promise<Actor[]> {
    const movieDataSources = context.movieDataSource;
    const actors = await movieDataSources.getActorsForMovie(movie._id);

    if (!actors) {
      return [];
    }
    return actors.sort((a, b) => a.name.localeCompare(b.name));
  },

  async labels(movie: Movie): Promise<Label[]> {
    const labels = await Movie.getLabels(movie);
    return labels.sort((a, b) => a.name.localeCompare(b.name));
  },

  rating(movie: Movie): Promise<number> {
    return Movie.getRating(movie);
  },

  async duration(movie: Movie, _: any, context: IzzyContext): Promise<number> {
    const scenes = await context.movieDataSource.getScenesForMovie(movie._id);
    return Movie.calculateDurationFromScenes(scenes);
  },

  async size(movie: Movie): Promise<number | null> {
    const scenesWithSource = (await Movie.getScenes(movie)).filter(
      (scene) => scene.meta && scene.path
    );
    return scenesWithSource.reduce((dur, scene) => dur + (scene.meta?.size || 0), 0);
  },

  async studio(movie: Movie): Promise<Studio | null> {
    if (movie.studio) {
      return Studio.getById(movie.studio);
    }
    return null;
  },
};
