import { AxiosError } from "axios";
import { useState } from "react";

import { sceneCardFragment } from "../fragments/scene";
import { IPaginationResult } from "../types/pagination";
import { IScene } from "../types/scene";
import { graphqlQuery } from "../util/gql";

export function useSceneList(initial: IPaginationResult<IScene>, query: any) {
  const [scenes, setScenes] = useState<IScene[]>(initial?.items || []);
  const [loading, setLoader] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [numItems, setNumItems] = useState(initial?.numItems ?? -1);
  const [numPages, setNumPages] = useState(initial?.numPages ?? -1);

  async function _fetchScenes(page = 0) {
    try {
      setLoader(true);
      setError(null);
      const result = await fetchScenes(page, query);
      setScenes(result.items);
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

  function editScene(sceneId: string, fn: (scene: IScene) => IScene): void {
    setScenes((scenes) => {
      const copy = [...scenes];
      const index = copy.findIndex((scene) => scene._id === sceneId);
      if (index > -1) {
        const scene = copy[index];
        copy.splice(index, 1, fn(scene));
      }
      return copy;
    });
  }

  return {
    scenes,
    loading,
    error,
    numItems,
    numPages,
    fetchScenes: _fetchScenes,
    editScene,
  };
}

export async function fetchScenes(page = 0, query: any) {
  const q = `
  query($query: SceneSearchQuery!, $seed: String) {
    getScenes(query: $query, seed: $seed) {
      items {
        ...SceneCard
      }
      numItems
      numPages
    }
  }
  ${sceneCardFragment}
`;

  const { getScenes } = await graphqlQuery<{
    getScenes: IPaginationResult<IScene>;
  }>(q, {
    query: {
      query: "",
      page,
      sortBy: "addedOn",
      sortDir: "desc",
      ...query,
    },
  });

  return getScenes;
}
