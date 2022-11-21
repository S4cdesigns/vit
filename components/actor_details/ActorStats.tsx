import { useTranslations } from "next-intl";

import StatCard from "./StatCard";

type Props = {
  numScenes: number;
  numWatches: number;
  averageRating: number;
  score: number;
  percentWatched: number;
};

export default function ActorStats(props: Props) {
  const t = useTranslations();

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(125px, 1fr))",
        gap: 10,
      }}
    >
      <StatCard title={t("scene", { numItems: 2 })}>{props.numScenes}</StatCard>
      <StatCard title={t("views", { numItems: 2 })}>{props.numWatches}</StatCard>
      <StatCard title={t("avgRating", { numItems: 2 })}>
        <span
          style={{
            color: props.averageRating >= 9 ? "#ff3355" : undefined,
          }}
        >
          {(props.averageRating / 2).toFixed(1)}
        </span>
      </StatCard>
      <StatCard title="scenes watched">{Math.round(props.percentWatched * 100)}%</StatCard>
      <StatCard title={t("pvScore", { numItems: 2 })}>{props.score}</StatCard>
    </div>
  );
}
