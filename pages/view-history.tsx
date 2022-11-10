import { useTranslations } from "next-intl";
import { useState } from "react";
import useSWR from "swr";
import AutoLayout from "../components/AutoLayout";

import PageWrapper from "../components/PageWrapper";
import Pagination from "../components/Pagination";
import ViewHistoryItem from "../components/ViewHistoryItem";
import { graphqlQuery } from "../util/gql";

async function getViewHistory() {
  const query = `
  query($min: Long, $max: Long) {
    getWatches(min: $min, max: $max) {
      date
      scene {
        _id
        name
        thumbnail {
          _id
          color
        }
        actors {
          _id
          name
        }
        labels {
          _id
          name
          color
        }
        studio {
          _id
          name
        }
      }
    }
  }
`;
  const { getWatches } = await graphqlQuery<{
    getWatches: {
      date: number;
      scene: {
        _id: string;
        name: string;
        thumbnail?: {
          _id: string;
          color?: string;
        };
        actors: {
          _id: string;
          name: string;
        }[];
        labels: {
          _id: string;
          name: string;
          color?: string;
        }[];
        studio?: {
          _id: string;
          name: string;
        };
      };
    }[];
  }>(query, {});

  return getWatches;
}

const PAGE_SIZE = 10;

export default function ViewHistoryPage() {
  const t = useTranslations();
  const [page, setPage] = useState(0);

  const { data: viewHistory } = useSWR("view-history", getViewHistory, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateOnMount: true,
  });

  if (!viewHistory) {
    return <PageWrapper title="View history">Loading...</PageWrapper>;
  }

  return (
    <PageWrapper title="View history">
      <div style={{ display: "flex", justifyContent: "center" }}>
        <AutoLayout style={{ maxWidth: 600, width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Pagination
              onChange={setPage}
              current={page}
              numPages={Math.ceil(viewHistory.length / PAGE_SIZE)}
            ></Pagination>
          </div>
          {viewHistory
            .slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)
            .map(({ date, scene }) => (
              <ViewHistoryItem key={date} date={new Date(date)} scene={scene} />
            ))}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Pagination
              onChange={setPage}
              current={page}
              numPages={Math.ceil(viewHistory.length / PAGE_SIZE)}
            ></Pagination>
          </div>
        </AutoLayout>
      </div>
    </PageWrapper>
  );
}
