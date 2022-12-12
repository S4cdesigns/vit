import axios from "axios";
import { useTranslations } from "next-intl";
import prettyBytes from "pretty-bytes";
import { ReactNode } from "react";
import useSWR from "swr";

import AutoLayout from "../../components/AutoLayout";
import Button from "../../components/Button";
import Card from "../../components/Card";
import CardSection from "../../components/CardSection";
import CardTitle from "../../components/CardTitle";
import Credits from "../../components/Credits";
import PageWrapper from "../../components/PageWrapper";
import ImageSettings from "../../components/settings/image_settings";
import Text from "../../components/Text";
import { useScanStatus } from "../../composables/use_scan_status";
import { getFullStatus, StatusData } from "../../util/status";

function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <AutoLayout gap={10}>
      <CardTitle>{title}</CardTitle>
      <Card>{children}</Card>
    </AutoLayout>
  );
}

function StatusSection({ status }: { status: StatusData }) {
  const t = useTranslations();

  return (
    <>
      <SettingsSection title="Izzy (database)">
        <CardSection title={t("status")}>
          <Text>{status.izzy.status}</Text>
        </CardSection>
        <CardSection title={t("version")}>
          <Text>{status.izzy.version}</Text>
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
      </SettingsSection>
      <SettingsSection title="Elasticsearch">
        <CardSection title={t("status")}>
          <Text>{status.elasticsearch.status}</Text>
        </CardSection>
        <CardSection title={t("version")}>
          <Text>{status.elasticsearch.version}</Text>
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
        <Button
          onClick={() => {
            if (window.confirm("Are your sure?")) {
              axios.post("/api/system/reindex").catch((error) => {
                console.error(error);
              });
            }
          }}
        >
          Reindex
        </Button>
      </SettingsSection>
    </>
  );
}

export default function SettingsPage() {
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

  const { scanStatus } = useScanStatus();

  return (
    <PageWrapper title={t("settings")}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <AutoLayout
          style={{
            width: "100%",
            maxWidth: 900,
          }}
        >
          <AutoLayout>
            <SettingsSection title="Image Settings">
              <ImageSettings />
            </SettingsSection>
            {!!scanStatus && (
              <SettingsSection title="Scan folders">
                <CardSection title={t("heading.videos")}>
                  <ul>
                    {scanStatus.folders?.videos.map((folder) => (
                      <li>{folder.path}</li>
                    ))}
                  </ul>
                </CardSection>
                <CardSection title={t("heading.images")}>
                  <ul>
                    {scanStatus.folders?.images.map((folder) => (
                      <li>{folder.path}</li>
                    ))}
                  </ul>
                </CardSection>
              </SettingsSection>
            )}
            {!!status && <StatusSection status={status} />}
            <SettingsSection title="Credits">
              <Credits />
            </SettingsSection>
          </AutoLayout>
        </AutoLayout>
      </div>
    </PageWrapper>
  );
}
