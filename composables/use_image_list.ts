import { AxiosError } from "axios";
import { useState } from "react";

import { imageCardFragment } from "../fragments/image";
import { IImage } from "../types/image";
import { IPaginationResult } from "../types/pagination";
import { graphqlQuery } from "../util/gql";

export function useImageList(initial: IPaginationResult<IImage>, query: any) {
  const [images, setImages] = useState<IImage[]>(initial?.items || []);
  const [loading, setLoader] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [numItems, setNumItems] = useState(initial?.numItems ?? -1);
  const [numPages, setNumPages] = useState(initial?.numPages ?? -1);

  async function _fetchImages(page = 0) {
    try {
      setLoader(true);
      setError(null);
      const result = await fetchImages(page, query);
      setImages(result.items);
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

  return {
    images,
    loading,
    error,
    numItems,
    numPages,
    fetchImages: _fetchImages,
  };
}

export async function fetchImages(page = 0, query: any) {
  const q = `
  query($query: ImageSearchQuery!, $seed: String) {
    getImages(query: $query, seed: $seed) {
      items {
        ...ImageCard
      }
      numItems
      numPages
    }
  }
  ${imageCardFragment}
`;

  const { getImages } = await graphqlQuery<{
    getImages: IPaginationResult<IImage>;
  }>(q, {
    query: {
      query: "",
      page,
      sortBy: "addedOn",
      sortDir: "desc",
      ...query,
    },
  });

  return getImages;
}
