import { useTranslations } from "next-intl";

import PageWrapper from "../components/PageWrapper";
import { IPaginationResult } from "../types/pagination";

export default function MarkerListPage(props: {
  page: number;
  initial: IPaginationResult<unknown>;
}) {
  const t = useTranslations();

  return <PageWrapper title={t("foundActors", { numItems: 0 })}>content</PageWrapper>;
}
