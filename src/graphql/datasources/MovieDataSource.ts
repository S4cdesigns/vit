import DataLoader from "dataloader";

import Actor from "../../types/actor";
import ActorReference from "../../types/actor_reference";
import Image from "../../types/image";
import Label from "../../types/label";
import MovieScene from "../../types/movie_scene";
import Scene from "../../types/scene";
import { BatchImageLoader, BatchLabelLoader } from "./loaders";

export class MovieDataSource {
  private batchImages = BatchImageLoader;
  private batchLabels = BatchLabelLoader;

  private batchScenes = new DataLoader(async (movieIds: readonly string[]) => {
    const movieScenes = await MovieScene.getByMovies(movieIds);
    const allSceneIds = Object.values(movieScenes)
      .flatMap((movieScenes) => movieScenes)
      .map((movieScene) => movieScene.scene);

    const allScenes = await Scene.getBulk(allSceneIds);

    return movieIds.map((movieId) => {
      const scenesForThisMovie = movieScenes[movieId];

      if (!scenesForThisMovie) {
        return [];
      }

      const sceneIdsInThisMovie = Object.values(scenesForThisMovie)
        .flatMap((movieScenes) => movieScenes)
        .map((movieScene) => movieScene.scene);

      return allScenes.filter((scene) =>
        sceneIdsInThisMovie.some((sceneId) => sceneId === scene._id)
      );
    });
  });

  private batchActors = new DataLoader(async (movieIds: readonly string[]) => {
    // first get all scenes for the movies
    const movieScenes = await MovieScene.getByMovies(movieIds);
    const sceneIds = Object.values(movieScenes)
      .flatMap((scenes) => scenes)
      .map((scene) => scene._id);
    const allRefs = await ActorReference.getByItemBulk(sceneIds);

    // now get all actors in all scenes of all movies
    const allActorIds = Object.values(allRefs)
      .flatMap((refs) => refs)
      .map((actorRef) => actorRef.actor);
    const allActors = await Actor.getBulk(allActorIds);

    // map each movieId to an array of Actors
    return movieIds.map((movieId) => {
      if (!movieScenes[movieId]) {
        return [];
      }

      const scenes = movieScenes[movieId];
      // find all actorReferences for this particular movie
      const actorRefsForAllScenesInMovie: Record<string, ActorReference[]> = Object.keys(allRefs)
        .filter((sceneId) => scenes.some((sc) => sc._id === sceneId))
        .reduce((obj, key) => {
          return Object.assign(obj, { [key]: allRefs[key] });
        }, {});

      // map to a set of actorIds contained in this movie
      const allActorIdsInThisMovie = Object.values(actorRefsForAllScenesInMovie)
        .flatMap((actors) => actors)
        .map((ref) => ref.actor);

      // now filter all actors which are in this particular movie
      return allActors.filter((actor) =>
        allActorIdsInThisMovie.some((actorId) => actorId === actor._id)
      );
    });
  });

  async getActorsForMovie(movieId: string): Promise<Actor[]> {
    return this.batchActors.load(movieId);
  }

  async getScenesForMovie(movieId: string): Promise<Scene[]> {
    return this.batchScenes.load(movieId);
  }

  async getCoverForMovie(imageId: string): Promise<Image> {
    return this.batchImages.load(imageId);
  }

  async getLabelsForMovie(movieId: string): Promise<Label[]> {
    return this.batchLabels.load(movieId);
  }
}
