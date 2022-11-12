import StatsIcon from "mdi-react/ChartBarStackedIcon";
import { useTranslations } from "next-intl";

import { useScanStatus } from "../../composables/use_scan_status";
import Button from "../Button";
import Text from "../Text";
import WidgetCard from "./WidgetCard";

export default function ScanCard() {
  const t = useTranslations();
  const { scanStatus, startScan } = useScanStatus();

  return (
    <WidgetCard icon={<StatsIcon />} title={t("scanStats")}>
      <Text>{scanStatus?.folders.videos.length} video folders</Text>
      <Text>{scanStatus?.folders.images.length} image folders</Text>
      <Button onClick={startScan} loading={scanStatus?.isScanning}>
        Start scan
      </Button>
    </WidgetCard>
  );
}
