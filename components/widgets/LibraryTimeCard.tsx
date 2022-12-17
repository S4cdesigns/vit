import Axios from "axios";
import TimeIcon from "mdi-react/TimelapseIcon";
import { useTranslations } from "next-intl";
import useSWR from "swr";

import Text from "../Text";
import WidgetCard from "./WidgetCard";

async function getWatchStats() {
  const res = await Axios.get<{
    numViews: number;
    numScenes: number;
    viewedPercent: number;
    remaining: number;
    remainingSeconds: number;
    remainingDays: number;
    remainingMonths: number;
    remainingYears: number;
    remainingTimestamp: number;
    currentInterval: number;
    currentIntervalDays: number;
  }>("/api/remaining-time");
  return res.data;
}

export default function LibraryTimeCard() {
  const t = useTranslations();

  const { data: stats } = useSWR("libraryTimeStats", getWatchStats, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    revalidateOnMount: true,
    refreshInterval: 300_000,
  });

  if (!stats) {
    return <></>;
  }

  return (
    <>
      <WidgetCard icon={<TimeIcon />} title={t("libraryTime")}>
        <Text>
          {t("viewsInDays", {
            numViews: stats.numViews,
            numDays: +stats.currentIntervalDays.toFixed(0),
          })}
        </Text>
        <Text>
          {t("percentWatched", {
            percent: `${(stats.viewedPercent * 100).toFixed(1)}%`,
          })}
        </Text>
        <Text>
          {t("contentLeft", {
            years: stats.remainingYears.toFixed(1),
          })}
        </Text>
        <Text>
          {t("runningOut", {
            date: new Date(stats.remainingTimestamp).toLocaleDateString(),
          })}
        </Text>
      </WidgetCard>
    </>
  );
}
