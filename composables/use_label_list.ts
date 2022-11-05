import { useEffect, useState } from "react";

import ILabel from "../types/label";
import { graphqlQuery } from "../util/gql";

async function fetchLabels() {
  const q = `
  {
    getLabels {
      _id
      name
      aliases
      color
    }
  }`;

  const { getLabels } = await graphqlQuery<{
    getLabels: ILabel[];
  }>(q, {});

  return getLabels;
}

export default function useLabelList() {
  const [labels, setLabels] = useState<ILabel[]>([]);
  const [loading, setLoader] = useState(true);

  async function load() {
    try {
      setLoader(true);
      setLabels(await fetchLabels());
    } catch (error) {}
    setLoader(false);
  }

  useEffect(() => {
    load().catch(() => {});
  }, []);

  return {
    labels,
    loading,
  };
}
