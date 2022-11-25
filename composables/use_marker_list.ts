import { AxiosError } from "axios";
import { useState } from "react";

import { markerCardFragment } from "../fragments/marker";
import { IMarker } from "../types/marker";
import { IPaginationResult } from "../types/pagination";
import { graphqlQuery } from "../util/gql";

export function useMarkerList(initial: IPaginationResult<IMarker>, query: any) {
  const [markers, setMarkers] = useState<IMarker[]>(initial?.items || []);
  const [loading, setLoader] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [numItems, setNumItems] = useState(initial?.numItems ?? -1);
  const [numPages, setNumPages] = useState(initial?.numPages ?? -1);

  async function _fetchMarkers(page = 0) {
    try {
      setLoader(true);
      setError(null);
      const result = await fetchMarkers(page, query);
      console.log("query", query);
      setMarkers(result.items);
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

  function editMarker(markerId: string, fn: (scene: IMarker) => IMarker): void {
    setMarkers((markers) => {
      const copy = [...markers];
      const index = copy.findIndex((marker) => marker._id === markerId);
      if (index > -1) {
        const marker = copy[index];
        copy.splice(index, 1, fn(marker));
      }
      return copy;
    });
  }

  return {
    markers,
    loading,
    error,
    numItems,
    numPages,
    fetchMarkers: _fetchMarkers,
    editMarker,
  };
}

export async function fetchMarkers(page = 0, query: any) {
  const q = `
  query($query: MarkerSearchQuery!, $seed: String) {
    getMarkers(query: $query, seed: $seed) {
      items {
        _id,
        name,
        favorite
        bookmark
        rating
        labels {
          _id
          name
        }
        actors {
          _id
          name
        }
        scene {
          _id
          name
        }
        time
        thumbnail {
          _id
        }
      }
      numItems
      numPages
    }
  }
`;

  const { getMarkers } = await graphqlQuery<{
    getMarkers: IPaginationResult<IMarker>;
  }>(q, {
    query: {
      query: "",
      page,
      sortBy: "addedOn",
      sortDir: "desc",
      ...query,
    },
  });

  return getMarkers;
}
