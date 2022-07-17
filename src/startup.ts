import execa from "execa";
import { platform } from "os";

import args from "./args";
import { deleteIzzy, ensureIzzyExists, izzyVersion, resetIzzy, spawnIzzy } from "./binaries/izzy";
import { checkConfig, findAndLoadConfig, getConfig } from "./config";
import { IConfig } from "./config/schema";
import { collectionDefinitions, collections, loadStore } from "./database";
import { loadEnv } from "./env";
import { applyExitHooks } from "./exit";
import { queueLoop } from "./queue_loop";
import { isBlacklisted } from "./search/image";
import startServer from "./server";
import Image from "./types/image";
import { handleError, logger } from "./utils/logger";
import { printMaxMemory } from "./utils/mem";
import { libraryPath } from "./utils/path";

function skipImage(image: Image) {
  if (!image.path) {
    logger.warn(`Image ${image._id}: no path`);
    return true;
  }
  if (image.thumbPath) {
    return true;
  }
  if (isBlacklisted(image.name)) {
    return true;
  }
  return false;
}

function imagemagickHelp(cmd: string, path: string) {
  if (platform() !== "win32" && path.endsWith(".exe")) {
    logger.warn(
      `It looks like you're not running Windows, but your config contains a .exe path.
Make sure to install imagemagick and set the correct imagemagick path in the config`
    );
  }
  if (platform() === "linux") {
    logger.warn(
      `Maybe try using something like: "sudo apt-get install imagemagick" and adjusting the ${cmd}Path in the config to "${cmd}"`
    );
  } else if (platform() === "darwin") {
    logger.warn(
      `Maybe try using something like: "brew install imagemagick" and adjusting the ${cmd}Path in the config to "${cmd}"`
    );
  } else if (platform() === "win32") {
    logger.warn(
      `Maybe try downloading the .exe from : "https://imagemagick.org/script/download.php" and adjusting the ${cmd}Path in the config to "${cmd}"`
    );
  }
}

export async function startup() {
  loadEnv();

  logger.debug("Startup...");
  logger.debug(args);

  printMaxMemory();

  let config: IConfig;

  try {
    const shouldRestart = await findAndLoadConfig();
    if (shouldRestart) {
      process.exit(0);
    }

    config = getConfig();
    checkConfig(config);
  } catch (err) {
    return handleError(`Error during startup`, err, true);
  }

  const magickBins = ["convert", "montage", "identify"];

  for (const bin of magickBins) {
    // @ts-ignore
    const path = config.imagemagick[`${bin}Path`];
    logger.verbose(`Checking imagemagick (${bin})...`);

    try {
      execa.sync(path, ["--version"]);
    } catch (err) {
      imagemagickHelp(bin, path);
      return handleError(`Failed to run imagemagick (${bin}) at ${path}`, err, true);
    }
  }

  if (args["generate-image-thumbnails"]) {
    if (await izzyVersion().catch(() => false)) {
      logger.info("Izzy already running, clearing...");
      await resetIzzy();
    } else {
      await spawnIzzy();
    }
    await loadStore(collectionDefinitions.images);
    await collections.images.compact();
    applyExitHooks();

    const images = await Image.getAll();

    let i = 0;
    let amountImagesToBeProcessed = 0;

    images.forEach((image) => {
      if (!skipImage(image)) {
        amountImagesToBeProcessed++;
      }
    });

    for (const image of images) {
      try {
        if (skipImage(image)) {
          continue;
        }
        i++;

        // Small image thumbnail
        logger.verbose(
          `${i}/${amountImagesToBeProcessed}: Creating image thumbnail for ${image._id}`
        );
        image.thumbPath = libraryPath(`thumbnails/images/${image._id}.jpg`);
        execa.sync(config.imagemagick.convertPath, [
          image.path!,
          "-resize",
          "320x320",
          image.thumbPath,
        ]);
        await collections.images.upsert(image._id, image);
      } catch (error) {
        handleError(`${image._id} (${image.path}) failed`, error);
      }
    }
    process.exit(0);
  }

  if (args["process-queue"]) {
    await queueLoop(config);
  } else {
    if (args["update-izzy"]) {
      await deleteIzzy();
    }

    try {
      let downloadedBins = 0;
      downloadedBins += await ensureIzzyExists();
      if (downloadedBins > 0) {
        logger.warn("Binaries downloaded. Please restart.");
        process.exit(0);
      }
      applyExitHooks();
      await startServer();
    } catch (err) {
      handleError(`Startup error`, err, true);
    }
  }
}
