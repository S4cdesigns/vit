import axios from "axios";
import useSWR from "swr";

type ScanFolder = {
  path: string;
  include: string[];
  exclude: string[];
  extensions: string[];
  enable: boolean;
};

export async function getScanStatus(): Promise<{
  folders: {
    videos: ScanFolder[];
    images: ScanFolder[];
  };
  isScanning: boolean;
  nextScanDate: string | null;
  nextScanTimestamp: number | null;
}> {
  const { data } = await axios.get("/api/scan/status");
  return data;
}

export function useScanStatus() {
  const { data: scanStatus, mutate } = useSWR("scan-status", getScanStatus, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    revalidateOnMount: true,
    refreshInterval: 5_000,
  });

  async function startScan() {
    if (scanStatus?.isScanning) {
      return;
    }
    await axios.post("/api/scan");
    mutate();
  }

  return {
    scanStatus,
    startScan,
  };
}
