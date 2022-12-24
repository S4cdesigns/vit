import { Masonry } from "masonic";
import { useTranslations } from "next-intl";
import MovieBoxRenderer from "../components/MovieBoxRenderer";

import PageWrapper from "../components/PageWrapper";
import FavoritesCard from "../components/widgets/FavoritesCard";
import LibraryTimeCard from "../components/widgets/LibraryTimeCard";
import ProcessingCard from "../components/widgets/ProcessingCard";
import ScanCard from "../components/widgets/ScanCard";
import StatsCard from "../components/widgets/StatsCard";

const widgets = [
  <StatsCard />,
  <ProcessingCard />,
  <ScanCard />,
  <LibraryTimeCard />,
  <FavoritesCard />,
];

export default function IndexPage() {
  const t = useTranslations();

  return (
    <PageWrapper title={t("overview")}>
      <MovieBoxRenderer
        frontCoverUrl="http://localhost:3000/api/media/image/im_k465s3rhsFlALdwC/thumbnail?password=xxx"
        backCoverUrl="http://localhost:3000/api/media/image/im_k465s7udiaYT7NEn/thumbnail?password=xxx"
        spineCoverUrl="http://localhost:3000/api/media/image/im_kfflitxbdjbWUp1R/thumbnail?password=xxx"
      />
      <Masonry
        items={widgets}
        rowGutter={10}
        columnGutter={10}
        render={({ data }) => data}
        columnWidth={300}
      />
    </PageWrapper>
  );
}
