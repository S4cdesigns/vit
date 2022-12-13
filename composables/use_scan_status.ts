import axios from "axios";
import useSWR from "swr";

type ScanFolder = {
  path: string;
  include: string[];
  exclude: string[];
  extensions: string[];
  enable: boolean;
};

type ScanStatus = {
  folders: {
    videos: ScanFolder[];
    images: ScanFolder[];
  };
  isScanning: boolean;
  nextScanDate: string | null;
  nextScanTimestamp: number | null;
};

export async function getScanStatus(): Promise<ScanStatus> {
  const { data } = await axios.get<ScanStatus>("/api/scan/status");
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
    mutate().catch(() => {});
  }

  return {
    scanStatus,
    startScan,
  };
}
