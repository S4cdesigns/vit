import { AxiosError } from "axios";
import { useState } from "react";

import { actorCardFragment } from "../fragments/actor";
import { IActor } from "../types/actor";
import { IPaginationResult } from "../types/pagination";
import { graphqlQuery } from "../util/gql";

export function useActorList(initial: IPaginationResult<IActor>, query: any) {
  const [actors, setActors] = useState<IActor[]>(initial?.items || []);
  const [loading, setLoader] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [numItems, setNumItems] = useState(initial?.numItems ?? -1);
  const [numPages, setNumPages] = useState(initial?.numPages ?? -1);

  async function _fetchActors(page = 0) {
    try {
      setLoader(true);
      setError(null);
      const result = await fetchActors(page, query);
      setActors(result.items);
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

  function editActor(actorId: string, fn: (actor: IActor) => IActor): void {
    setActors((actors) => {
      const copy = [...actors];
      const index = copy.findIndex((actor) => actor._id === actorId);
      if (index > -1) {
        const actor = copy[index];
        copy.splice(index, 1, fn(actor));
      }
      return copy;
    });
  }

  function setData(data: IPaginationResult<IActor>): void {
    setActors(data.items);
    setNumItems(data.numItems);
    setNumPages(data.numPages);
  }

  return {
    actors,
    loading,
    error,
    numItems,
    numPages,
    fetchActors: _fetchActors,
    editActor,
    setData,
  };
}

export async function fetchActors(page = 0, query: any) {
  const q = `
  query($query: ActorSearchQuery!, $seed: String) {
    getActors(query: $query, seed: $seed) {
      items {
        ...ActorCard
      }
      numItems
      numPages
    }
  }
  ${actorCardFragment}
`;

  const { getActors } = await graphqlQuery<{
    getActors: IPaginationResult<IActor>;
  }>(q, {
    query: {
      query: "",
      page,
      sortBy: "addedOn",
      sortDir: "desc",
      ...query,
    },
    seed: Math.random().toString(),
  });

  return getActors;
}
