import { Router } from "express";

import { getConfig } from "../config";
import { isScanning, nextScanTimestamp, scanFolders } from "../scanner";
import { handleError } from "../utils/logger";

const router = Router();

// TODO:
router.post("/folders", (req, res) => {
  res.json({
    message: "OK",
  });
});

router.post("/", (req, res) => {
  if (isScanning) {
    res.status(409).json("Scan already in progress");
  } else {
    const config = getConfig();
    scanFolders(config.import.scanInterval).catch((err: Error) => {
      handleError("Error starting scan: ", err);
    });
    res.json("Started scan.");
  }
});

router.get(["/", "/status"], (req, res) => {
  const { images, videos } = getConfig().import;

  res.json({
    folders: {
      images,
      videos,
      amount: images.length + videos.length,
    },
    isScanning,
    nextScanDate: nextScanTimestamp ? new Date(nextScanTimestamp).toLocaleString() : null,
    nextScanTimestamp,
  });
});

export default router;
