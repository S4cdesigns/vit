import Head from "next/head";
import { useTranslations } from "next-intl";

import FavoritesCard from "../components/widgets/FavoritesCard";
import LibraryTimeCard from "../components/widgets/LibraryTimeCard";
import ScanCard from "../components/widgets/ScanCard";
import StatsCard from "../components/widgets/StatsCard";
import { Masonry } from "masonic";

const widgets = [<StatsCard />, <FavoritesCard />, <ScanCard />, <LibraryTimeCard />];

export default function IndexPage() {
  const t = useTranslations();

  return (
    <div style={{ padding: 10 }}>
      <Head>
        <title>{t("overview")}</title>
      </Head>
      {/*   <div>
        <input
          type="file"
          onChange={(ev) => {
            const fileReader = new FileReader();

            fileReader.onload = (ev) => {
              setSrc(ev.target!.result!.toString());
            };

            fileReader.readAsDataURL(ev.target.files![0]);
          }}
        />
      </div> */}

      <Masonry
        items={widgets}
        rowGutter={1}
        columnGutter={4}
        render={({ data }) => data}
        columnWidth={300}
      />
    </div>
  );
}
