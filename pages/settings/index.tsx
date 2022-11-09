import axios from "axios";
import { useTranslations } from "next-intl";
import prettyBytes from "pretty-bytes";
import useSWR from "swr";

import AutoLayout from "../../components/AutoLayout";
import Card from "../../components/Card";
import CardSection from "../../components/CardSection";
import CardTitle from "../../components/CardTitle";
import Loader from "../../components/Loader";
import PageWrapper from "../../components/PageWrapper";
import Text from "../../components/Text";
import { getFullStatus, StatusData } from "../../util/status";

function StatusSection({ status }: { status: StatusData }) {
  const t = useTranslations();

  return (
    <>
      <Card>
        <CardTitle>Izzy (database)</CardTitle>
        <CardSection title={t("status")}>
          <div style={{ opacity: 0.66 }}>{status.izzy.status}</div>
        </CardSection>
        <CardSection title={t("version")}>
          <div style={{ opacity: 0.66 }}>{status.izzy.version}</div>
        </CardSection>
        <div>
          <table>
            <thead>
              <tr>
                <th>{t("name")}</th>
                <th>{t("size")}</th>
                <th>{t("documentCount")}</th>
              </tr>
            </thead>
            <tbody>
              {status.izzy.collections.map((collection) => (
                <tr key={collection.name}>
                  <td>{collection.name}</td>
                  <td title={`${collection.size} bytes`}>{prettyBytes(collection.size / 1000)}</td>
                  <td>{collection.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card>
        <CardTitle>Elasticsearch</CardTitle>
        <CardSection title={t("status")}>
          <div style={{ opacity: 0.66 }}>{status.elasticsearch.status}</div>
        </CardSection>
        <CardSection title={t("version")}>
          <div style={{ opacity: 0.66 }}>{status.elasticsearch.version}</div>
        </CardSection>
        <div>
          <table>
            <thead>
              <tr>
                <th>{t("name")}</th>
                <th>Health</th>
                <th>{t("status")}</th>
                <th>{t("size")}</th>
                <th>{t("documentCount")}</th>
              </tr>
            </thead>
            <tbody>
              {status.elasticsearch.indices.map((index) => (
                <tr key={index.uuid}>
                  <td>{index.index}</td>
                  <td style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div
                      style={{
                        borderRadius: "50%",
                        backgroundColor: index.health,
                        border: "1px solid grey",
                        width: 16,
                        height: 16,
                      }}
                    />
                    {index.health}
                  </td>
                  <td>{index.status}</td>
                  <td>{index["store.size"]}</td>
                  <td>{index["docs.count"]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Text>Note: Health "green" and "yellow" are OK</Text>
      </Card>
    </>
  );
}

async function getScanFolders(): Promise<{
  videos: {
    path: string;
    include: string[];
    exclude: string[];
    extensions: string[];
    enable: boolean;
  }[];
  images: {
    path: string;
    include: string[];
    exclude: string[];
    extensions: string[];
    enable: boolean;
  }[];
}> {
  const { data } = await axios.get("/api/scan/folders");
  return data;
}

export default function SettingsPage() {
  // /api/scan/folders
  const t = useTranslations();
  const { data: status } = useSWR(
    "settings:status",
    () => getFullStatus().then((res) => res.data),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      revalidateOnMount: true,
      refreshInterval: 15_000,
    }
  );
  const { data: scanFolders } = useSWR("settings:scan-folders", getScanFolders, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    revalidateOnMount: true,
    refreshInterval: 15_000,
  });

  return (
    <PageWrapper title={t("settings")}>
      <AutoLayout>
        <CardTitle>{t("settings")}</CardTitle>
        <AutoLayout
          style={{
            width: "100%",
            maxWidth: 1000,
          }}
        >
          {!!scanFolders && (
            <Card>
              <CardTitle>Scan folders</CardTitle>
              <CardSection title={t("heading.videos")}>
                <ul>
                  {scanFolders.videos.map((folder) => (
                    <li>{folder.path}</li>
                  ))}
                </ul>
              </CardSection>
              <CardSection title={t("heading.images")}>
                <ul>
                  {scanFolders.images.map((folder) => (
                    <li>{folder.path}</li>
                  ))}
                </ul>
              </CardSection>
            </Card>
          )}
          {!!status && <StatusSection status={status} />}
        </AutoLayout>
      </AutoLayout>
    </PageWrapper>
  );
}
