import { describe, it, expect, beforeAll, afterAll } from "vitest";

import { ensureIndices } from ".";
import { loadTestConfig } from "../../test/config";
import { collections, loadStores } from "../database";
import Movie from "../types/movie";
import { indexMovies, searchMovies } from "./movie";

describe("search", () => {
  beforeAll(async () => {
    loadTestConfig();
    await loadStores();
  });

  describe("movies", () => {
    const movie = new Movie("Double Pounding");

    beforeAll(async () => {
      await ensureIndices(true);
      expect(await Movie.getAll()).to.be.empty;
      await collections.movies.upsert(movie._id, movie);
      await indexMovies([movie]);
      expect(await Movie.getAll()).to.have.lengthOf(1);
    });

    afterAll(async () => {
      await collections.movies.remove(movie._id);
    });

    it("Should find movie by name", async () => {
      const searchResult = await searchMovies({
        query: "pounding",
      });
      expect(searchResult).to.deep.equal({
        items: [movie._id],
        total: 1,
        numPages: 1,
      });
    });

    it("Should not find movie with bad query", async () => {
      const searchResult = await searchMovies({
        query: "asdva35aeb5se5b",
      });
      expect(searchResult).to.deep.equal({
        items: [],
        total: 0,
        numPages: 0,
      });
    });
  });

  describe("movies underscored", () => {
    const movie = new Movie("Double_Pounding");

    beforeAll(async () => {
      await ensureIndices(true);
      expect(await Movie.getAll()).to.be.empty;
      await collections.movies.upsert(movie._id, movie);
      await indexMovies([movie]);
      expect(await Movie.getAll()).to.have.lengthOf(1);
    });

    afterAll(async () => {
      await collections.movies.remove(movie._id);
    });

    it("Should find movie by name with underscores", async () => {
      const searchResult = await searchMovies({
        query: "pounding",
      });
      expect(searchResult).to.deep.equal({
        items: [movie._id],
        total: 1,
        numPages: 1,
      });
    });
  });

  describe("movies dotted", () => {
    const movie = new Movie("Anal.Oil.Latex");

    beforeAll(async () => {
      await ensureIndices(true);
      expect(await Movie.getAll()).to.be.empty;
      await collections.movies.upsert(movie._id, movie);
      await indexMovies([movie]);
      expect(await Movie.getAll()).to.have.lengthOf(1);
    });

    afterAll(async () => {
      await collections.movies.remove(movie._id);
    });

    it("Should find movie by name with dots", async () => {
      const searchResult = await searchMovies({
        query: "oil",
      });
      expect(searchResult).to.deep.equal({
        items: [movie._id],
        total: 1,
        numPages: 1,
      });
    });
  });
});
