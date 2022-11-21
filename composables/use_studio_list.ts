import { AxiosError } from "axios";
import { useState } from "react";

import { studioCardFragment } from "../fragments/studio";
import { IPaginationResult } from "../types/pagination";
import { IStudio } from "../types/studio";
import { graphqlQuery } from "../util/gql";

type StudioListItem = Omit<IStudio, "substudios">;

export function useStudioList(initial: IPaginationResult<StudioListItem>, query: any) {
  const [studios, setStudios] = useState<StudioListItem[]>(initial?.items || []);
  const [loading, setLoader] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [numItems, setNumItems] = useState(initial?.numItems ?? -1);
  const [numPages, setNumPages] = useState(initial?.numPages ?? -1);

  async function _fetchStudios(page = 0) {
    try {
      setLoader(true);
      setError(null);
      const result = await fetchStudios(page, query);
      setStudios(result.items);
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

  function editStudio(studioId: string, fn: (studio: StudioListItem) => StudioListItem): void {
    setStudios((studios) => {
      const copy = [...studios];
      const index = copy.findIndex((studio) => studio._id === studioId);
      if (index > -1) {
        const studio = copy[index];
        copy.splice(index, 1, fn(studio));
      }
      return copy;
    });
  }

  return {
    studios,
    loading,
    error,
    numItems,
    numPages,
    fetchStudios: _fetchStudios,
    editStudio,
  };
}

export async function fetchStudios(page = 0, query: any) {
  const q = `
  query($query: StudioSearchQuery!, $seed: String) {
    getStudios(query: $query, seed: $seed) {
      items {
        ...StudioCard
      }
      numItems
      numPages
    }
  }
  ${studioCardFragment}
`;

  const { getStudios } = await graphqlQuery<{
    getStudios: IPaginationResult<IStudio>;
  }>(q, {
    query: {
      query: "",
      page,
      sortBy: "addedOn",
      sortDir: "desc",
      ...query,
    },
  });

  return getStudios;
}
