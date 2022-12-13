import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import AutoLayout from "../components/AutoLayout";
import Button from "../components/Button";
import LabelSelector from "../components/LabelSelector";
import ListWrapper from "../components/ListWrapper";
import PageWrapper from "../components/PageWrapper";
import Spacer from "../components/Spacer";
import useLabelList, { fetchLabels } from "../composables/use_label_list";
import ILabel from "../types/label";
import { buildQueryParser } from "../util/query_parser";

const queryParser = buildQueryParser({
  q: {
    default: "",
  },
});

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { q } = queryParser.parse(query);

  const result = await fetchLabels();

  return {
    props: {
      initial: result,
    },
  };
};

export default function LabelListPage(props: { page: number; initial: ILabel[] }) {
  const router = useRouter();
  const t = useTranslations();

  const parsedQuery = useMemo(() => queryParser.parse(router.query), []);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  const [query, setQuery] = useState(parsedQuery.q);

  const { labels, loading } = useLabelList();
  const numItems: number = props.initial.length;

  const refresh = () => {
    alert("refresh");
  };

  return (
    <PageWrapper title={t("foundMovies", { numItems })}>
      <AutoLayout>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ fontSize: 20, fontWeight: "bold" }}>{t("foundMovies", { numItems })}</div>
          <Spacer />
        </div>
        <div style={{ display: "flex", alignItems: "center" }}></div>
        <AutoLayout layout="h" gap={10}>
          <input
            type="text"
            onKeyDown={(ev) => {
              /*
              if (ev.key === "Enter") {
                refresh().catch(() => {});
              }
              */
            }}
            placeholder={t("findContent")}
            value={query}
            onChange={(ev) => setQuery(ev.target.value)}
          />
          <Spacer />
          <Button loading={loading} onClick={refresh}>
            {t("refresh")}
          </Button>
        </AutoLayout>
        <ListWrapper loading={loading} noResults={!numItems}>
          <LabelSelector
            items={labels}
            onChange={setSelectedLabels}
            selected={selectedLabels}
            editEnabled
          />
        </ListWrapper>
      </AutoLayout>
    </PageWrapper>
  );
}
