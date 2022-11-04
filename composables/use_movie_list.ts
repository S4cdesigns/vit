import { AxiosError } from "axios";
import { useState } from "react";

import { movieCardFragment } from "../fragments/movie";
import { IMovie } from "../types/movie";
import { IPaginationResult } from "../types/pagination";
import { graphqlQuery } from "../util/gql";

export function useMovieList(initial: IPaginationResult<IMovie>, query: any) {
  const [movies, setMovies] = useState<IMovie[]>(initial?.items || []);
  const [loading, setLoader] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [numItems, setNumItems] = useState(initial?.numItems ?? -1);
  const [numPages, setNumPages] = useState(initial?.numPages ?? -1);

  async function _fetchMovies(page = 0) {
    try {
      setLoader(true);
      setError(null);
      const result = await fetchMovies(page, query);
      setMovies(result.items);
      setNumItems(result.numItems);
      setNumPages(result.numPages);
    } catch (fetchError: any) {
      const axioxError = fetchError as AxiosError;
      if (!axioxError.response) {
        setError(axioxError.message);
      } else {
        setError(axioxError.message);
      }
    }
    setLoader(false);
  }

  function editMovie(movieId: string, fn: (movie: IMovie) => IMovie): void {
    setMovies((movies) => {
      const copy = [...movies];
      const index = copy.findIndex((movie) => movie._id === movieId);
      if (index > -1) {
        const movie = copy[index];
        copy.splice(index, 1, fn(movie));
      }
      return copy;
    });
  }

  return {
    movies,
    loading,
    error,
    numItems,
    numPages,
    fetchMovies: _fetchMovies,
    editMovie,
  };
}

export async function fetchMovies(page = 0, query: any) {
  const q = `
  query($query: MovieSearchQuery!, $seed: String) {
    getMovies(query: $query, seed: $seed) {
      items {
        ...MovieCard
      }
      numItems
      numPages
    }
  }
  ${movieCardFragment}
`;

  const { getMovies } = await graphqlQuery<{
    getMovies: IPaginationResult<IMovie>;
  }>(q, {
    query: {
      query: "",
      page,
      sortBy: "addedOn",
      sortDir: "desc",
      ...query,
    },
  });

  return getMovies;
}
