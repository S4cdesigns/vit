import { existsSync, rmSync } from "fs";
import { basename, resolve } from "path";

import { createVault } from "../src/app";
import { getFFMpegURL, getFFProbeURL } from "../src/binaries/ffmpeg-download";
import { ensureIzzyExists, izzyVersion, resetIzzy, spawnIzzy } from "../src/binaries/izzy";
import { getConfig, resetLoadedConfig, setConfig } from "../src/config";
import defaultConfig from "../src/config/default";
import { IConfig } from "../src/config/schema";
import { loadStores } from "../src/database";
import { ensureIndices, refreshClient } from "../src/search";
import { downloadFFLibs } from "../src/setup";
import { handleError } from "../src/utils/logger";

const PORT = 5000;
const IZZY_PORT = 8500;
const TEST_FOLDER = ".test";
/* const TEST_LIBRARY_FOLDER = resolve(TEST_FOLDER, "library"); */
/* const TEST_CONFIG_PATH = resolve(TEST_FOLDER, "config.json"); */

function cleanupFiles() {
  resetLoadedConfig();

  if (existsSync(TEST_FOLDER)) {
    rmSync(TEST_FOLDER, { recursive: true });
  }

  // Do not delete binaries, so the next run will be faster
}

export default async function () {
  console.error("Test startup");
  cleanupFiles();

  const testConfig: IConfig = {
    ...defaultConfig,
    binaries: {
      ...defaultConfig.binaries,
      izzyPort: IZZY_PORT,
    },
    persistence: {
      ...defaultConfig.persistence,
      libraryPath: "test",
    },
    processing: {
      ...defaultConfig.processing,
      generatePreviews: false,
    },
    import: {
      ...defaultConfig.import,
      scanOnStartup: false,
      scanInterval: 0,
    },
    server: {
      ...defaultConfig.server,
      port: PORT,
    },
    log: {
      ...defaultConfig.log,
      level: "verbose",
    },
    search: {
      ...defaultConfig.search,
      host: process.env.ES_TEST_URL || "http://elasticsearch:9200",
    },
  };
  setConfig(testConfig);
  refreshClient(testConfig);

  if (!getConfig()) {
    console.log("Didn't load config");
    process.exit(1);
  }

  /* if (!existsSync(basename(getFFMpegURL())) || !basename(getFFProbeURL())) {
    await downloadFFLibs(TEST_FOLDER);
    console.log("Downloaded binaries");
  }

  console.log(`Starting test server on port ${PORT}`);
  console.log(`Test izzy port = ${IZZY_PORT}`);

  await ensureIzzyExists();

  const vault = await createVault();

  await vault.startServer(PORT);

  console.log(`Server running on port ${PORT}`);

  vault.setupMessage = "Loading database...";
  if (await izzyVersion().catch(() => false)) {
    console.log("Izzy already running, clearing...");
    await resetIzzy();
  } else {
    console.log("Spawning Izzy");
    await spawnIzzy();
  }

  try {
    await loadStores();
  } catch (error) {
    handleError(
      `Error while loading database, try restarting; if the error persists, your database may be corrupted`,
      error,
      true
    );
  }

  vault.setupMessage = "Loading search engine...";

  try {
    // Clear indices for every test
    await ensureIndices(true);
  } catch (error) {
    process.exit(1);
  }

  vault.serverReady = true; */

  return async () => {
    console.log("Closing test server");
    cleanupFiles();
    /* vault.close(); */
  };
}
