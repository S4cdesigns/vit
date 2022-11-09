import { useState } from "react";

import useUpdateEffect from "./use_update_effect";

type Props<T> = {
  initialPage: number;
  querySettings: unknown[];
  fetch: (page?: number) => Promise<void>;
};

export function usePaginatedList<T>(opts: Props<T>) {
  const [page, setPage] = useState(opts.initialPage);

  async function onPageChange(x: number): Promise<void> {
    setPage(x);
    await opts.fetch(x);
  }

  useUpdateEffect(() => {
    setPage(0);
  }, opts.querySettings);

  return { page, onPageChange };
}
