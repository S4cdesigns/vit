import Axios from "axios";
import StatsIcon from "mdi-react/ChartBarStackedIcon";
import { useTranslations } from "next-intl";
import useSWR from "swr";

import WidgetCard from "./WidgetCard";

async function getInfo() {
  const res = await Axios.post<{
    data: {
      numScenes: number;
      numActors: number;
      numMovies: number;
      numImages: number;
      numStudios: number;
    };
  }>("/api/ql", {
    query: `
    {
      numScenes
      numActors
      numMovies
      numImages
      numStudios
    }
    `,
  });
  return {
    numScenes: res.data.data.numScenes,
    numActors: res.data.data.numActors,
    numMovies: res.data.data.numMovies,
    numImages: res.data.data.numImages,
    numStudios: res.data.data.numStudios,
  };
}

export default function StatsCard() {
  const t = useTranslations();

  const { data: stats } = useSWR("stats", getInfo, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    revalidateOnMount: true,
    refreshInterval: 60_000,
  });

  return (
    <WidgetCard icon={<StatsIcon />} title={t("stats")}>
      <div>
        <span style={{ fontSize: 32, fontWeight: 400 }}>{stats?.numScenes || 0}</span>{" "}
        <span style={{ opacity: 0.8 }}>{t("scene", { numItems: stats?.numScenes || 0 })}</span>
      </div>
      <div>
        <span style={{ fontSize: 32, fontWeight: 400 }}>{stats?.numActors || 0}</span>{" "}
        <span style={{ opacity: 0.8 }}> {t("actor", { numItems: stats?.numActors || 0 })}</span>
      </div>
      <div>
        <span style={{ fontSize: 32, fontWeight: 400 }}>{stats?.numMovies || 0}</span>{" "}
        <span style={{ opacity: 0.8 }}> {t("movie", { numItems: stats?.numMovies || 0 })}</span>
      </div>
      <div>
        <span style={{ fontSize: 32, fontWeight: 400 }}>{stats?.numStudios || 0}</span>{" "}
        <span style={{ opacity: 0.8 }}> {t("studio", { numItems: stats?.numStudios || 0 })}</span>
      </div>
      <div>
        <span style={{ fontSize: 32, fontWeight: 400 }}>{stats?.numImages || 0}</span>{" "}
        <span style={{ opacity: 0.8 }}> {t("image", { numItems: stats?.numImages || 0 })}</span>
      </div>
    </WidgetCard>
  );
}
