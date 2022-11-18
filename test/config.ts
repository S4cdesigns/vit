import { resolve } from "path";
import { setConfig } from "../src/config";
import defaultConfig from "../src/config/default";
import { IConfig } from "../src/config/schema";
import { refreshClient } from "../src/search";

const PORT = 5000;
const IZZY_PORT = 8500;
const TEST_FOLDER = ".test";
const TEST_LIBRARY_FOLDER = resolve(TEST_FOLDER, "library");

export function loadTestConfig() {
  const testConfig: IConfig = {
    ...defaultConfig,
    binaries: {
      ...defaultConfig.binaries,
      izzyPort: IZZY_PORT,
    },
    persistence: {
      ...defaultConfig.persistence,
      libraryPath: TEST_LIBRARY_FOLDER,
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
}
