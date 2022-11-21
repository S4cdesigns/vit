import { existsSync, mkdirSync, rmSync } from "fs";
import { basename } from "path";

import { getFFMpegURL, getFFProbeURL } from "../src/binaries/ffmpeg-download";
import {
  ensureIzzyExists,
  exitIzzy,
  izzyVersion,
  resetIzzy,
  spawnIzzy,
} from "../src/binaries/izzy";
import { getConfig, resetLoadedConfig } from "../src/config";
import { downloadFFLibs } from "../src/setup";
import { loadTestConfig } from "./config";

const PORT = 5000;
const IZZY_PORT = 8500;
const TEST_FOLDER = ".test";

function cleanupFiles() {
  resetLoadedConfig();

  if (existsSync(TEST_FOLDER)) {
    rmSync(TEST_FOLDER, { recursive: true });
  }
  mkdirSync(TEST_FOLDER, { recursive: true });

  // Do not delete binaries, so the next run will be faster
}

export default async function () {
  console.error("Test startup");
  cleanupFiles();

  loadTestConfig();

  if (!getConfig()) {
    console.log("Didn't load config");
    process.exit(1);
  }

  if (!existsSync(basename(getFFMpegURL())) || !basename(getFFProbeURL())) {
    await downloadFFLibs(TEST_FOLDER);
    console.log("Downloaded binaries");
  }

  console.log(`Starting test server on port ${PORT}`);
  console.log(`Test izzy port = ${IZZY_PORT}`);

  await ensureIzzyExists();

  if (await izzyVersion().catch(() => false)) {
    console.log("Izzy already running, clearing...");
    await resetIzzy();
  } else {
    console.log("Spawning Izzy");
    await spawnIzzy();
  }

  return async () => {
    console.log("Closing test server");
    cleanupFiles();
    await exitIzzy();
    /* vault.close(); */
  };
}
