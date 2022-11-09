import StatsIcon from "mdi-react/ChartBarStackedIcon";
import { useTranslations } from "next-intl";
import useSWR from "swr";

import { graphqlQuery } from "../../util/gql";
import WidgetCard from "./WidgetCard";

async function getInfo() {
  const query = `
  {
    numScenes
    numActors
    numMovies
    numImages
    numStudios
  }`;

  const data = await graphqlQuery<{
    numScenes: number;
    numActors: number;
    numMovies: number;
    numImages: number;
    numStudios: number;
  }>(query, {});

  return {
    numScenes: data.numScenes,
    numActors: data.numActors,
    numMovies: data.numMovies,
    numImages: data.numImages,
    numStudios: data.numStudios,
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
