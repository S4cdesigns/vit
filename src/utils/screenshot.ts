import { randomUUID } from "crypto";
import ffmpeg from "fluent-ffmpeg";
import { resolve } from "path";
import asyncPool from "tiny-async-pool";

import { ThumbnailFile } from "../types/scene";
import { readdirAsync, statAsync } from "./fs/async";
import { formatMessage, logger } from "./logger";
import { libraryPath } from "./path";

type ScreenshotOptions = {
  filePrefix?: string;
  videoFile: string;
  timestamps: string[];
  outputFolder: string;
  width: number;
};

export async function generateScreenshots(opts: ScreenshotOptions): Promise<ThumbnailFile[]> {
  const filePrefix = opts.filePrefix || randomUUID();
  const pattern = `${filePrefix}-screenshot-{{index}}.jpg`;

  logger.debug(`Creating screenshots with options: ${formatMessage({ ...opts, pattern })}`);

  await asyncPool(4, opts.timestamps, (timestamp) => {
    return new Promise<void>((resolve, reject) => {
      const index = opts.timestamps.findIndex((s) => s === timestamp);
      logger.silly(`Creating screenshot ${index}...`);

      ffmpeg(opts.videoFile)
        .on("end", () => {
          logger.silly(`Created screenshot ${index}`);
          resolve();
        })
        .on("error", (err: Error) => {
          logger.error(`Screenshot generation failed for screenshot ${index}`);
          logger.error({
            ...opts,
            pattern,
            timestamp,
          });
          reject(err);
        })
        .screenshots({
          count: 1,
          timemarks: [timestamp],
          // Note: we can't use the FFMPEG index syntax
          // because we're generating 1 screenshot at a time instead of N
          filename: pattern.replace("{{index}}", index.toString().padStart(3, "0")),
          folder: opts.outputFolder,
          size: `${opts.width}x?`,
        });
    });
  });

  const screenshotFilenames = (await readdirAsync(opts.outputFolder)).filter((name) =>
    name.startsWith(filePrefix)
  );

  const screenshotFiles = await Promise.all(
    screenshotFilenames.map(async (name) => {
      const filePath = resolve(opts.outputFolder, name);
      const stats = await statAsync(filePath);
      return {
        name,
        path: filePath,
        size: stats.size,
        time: stats.mtime.getTime(),
      };
    })
  );

  screenshotFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

  logger.verbose(`Generated ${screenshotFiles.length} screenshots.`);

  return screenshotFiles;
}
