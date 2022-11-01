import Axios from "axios";
import SettingsIcon from "mdi-react/SettingsIcon";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import useSWR from "swr";

import Loader from "../Loader";
import WidgetCard from "./WidgetCard";

async function getQueueStats() {
  const { data } = await Axios.post<{
    data: {
      getQueueInfo: {
        length: number;
        processing: boolean;
      };
    };
  }>("/api/ql", {
    query: `
{ 
  getQueueInfo {    
    length 
    processing 
  }
}
    `,
  });
  return data.data.getQueueInfo;
}

export default function LibraryTimeCard() {
  const t = useTranslations();

  const { data: stats } = useSWR("scanStats", getQueueStats, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    revalidateOnMount: true,
    refreshInterval: 5_000,
  });

  return (
    <WidgetCard icon={<SettingsIcon />} title={t("videoProcessingQueue")}>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <div>
          {t("video", {
            numItems: stats?.length || 0,
          })}
        </div>
        {stats?.processing && <Loader />}
      </div>
    </WidgetCard>
  );
}
