import { Masonry } from "masonic";
import { useTranslations } from "next-intl";

import PageWrapper from "../components/PageWrapper";
import FavoritesCard from "../components/widgets/FavoritesCard";
import LibraryTimeCard from "../components/widgets/LibraryTimeCard";
import ScanCard from "../components/widgets/ScanCard";
import StatsCard from "../components/widgets/StatsCard";

const widgets = [<StatsCard />, <FavoritesCard />, <ScanCard />, <LibraryTimeCard />];

export default function IndexPage() {
  const t = useTranslations();

  return (
    <PageWrapper title={t("overview")}>
      <Masonry
        items={widgets}
        rowGutter={1}
        columnGutter={4}
        render={({ data }) => data}
        columnWidth={300}
      />
    </PageWrapper>
  );
}
