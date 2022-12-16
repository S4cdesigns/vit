import DeleteIcon from "mdi-react/DeleteIcon";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import AutoLayout from "../components/AutoLayout";
import Button from "../components/Button";
import LabelCreator from "../components/LabelCreator";
import LabelSelector from "../components/LabelSelector";
import ListWrapper from "../components/ListWrapper";
import PageWrapper from "../components/PageWrapper";
import Spacer from "../components/Spacer";
import { fetchLabels } from "../composables/use_label_list";
import ILabel from "../types/label";
import { graphqlQuery } from "../util/gql";

export const getServerSideProps: GetServerSideProps = async () => {
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

  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [labels, setLabels] = useState<ILabel[]>([]);

  const doLoad = async () => {
    setLoading(true);
    const labels = await fetchLabels();
    setLabels(labels);
  };

  useEffect(() => {
    doLoad()
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function removeLabels() {
    const query = `
  mutation ($ids: [String!]!) {
    removeLabels(ids: $ids) 
  }
 `;

    await graphqlQuery(query, {
      ids: selectedLabels,
    });
    setSelectedLabels([]);
  }

  const normalizedFilter = query.toLowerCase().trim();

  async function refresh() {
    try {
      await doLoad();
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  }

  const filterLabel = (label: ILabel, index: number) => {
    if (normalizedFilter.length === 0) {
      return true;
    }

    const name = `${label.name?.toLowerCase()}${label.aliases?.join("").toLowerCase()}`;

    if (!name) {
      return true;
    }

    return name.indexOf(normalizedFilter) >= 0;
  };

  const filteredLabels = labels.filter(filterLabel);

  const numItems: number = filteredLabels.length;

  return (
    <PageWrapper title={t("foundLabels", { numItems })}>
      <AutoLayout>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ fontSize: 20, fontWeight: "bold" }}>{t("foundLabels", { numItems })}</div>
          <Spacer />
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <LabelCreator onCreate={refresh} />
        </div>
        <AutoLayout layout="h" gap={10}>
          <input
            autoFocus
            type="text"
            placeholder={"Filter labels"}
            value={query}
            onChange={(ev) => setQuery(ev.target.value)}
          />
          <Spacer />
          {selectedLabels.length > 0 && (
            <Button
              style={{ backgroundColor: "#ab1b1b" }}
              className="hover"
              onClick={async () => {
                if (window.confirm(`Really delete ${selectedLabels.length} labels?`)) {
                  await removeLabels();
                  await refresh();
                }
              }}
            >
              Delete {selectedLabels.length} labels
            </Button>
          )}
          <Button loading={loading} onClick={refresh}>
            {t("refresh")}
          </Button>
        </AutoLayout>
        <ListWrapper loading={loading} noResults={!numItems}>
          <LabelSelector
            filter={query}
            onEdit={async () => await refresh()}
            items={filteredLabels}
            onChange={setSelectedLabels}
            selected={selectedLabels}
            editEnabled
          />
        </ListWrapper>
      </AutoLayout>
    </PageWrapper>
  );
}
