import { createHash } from "crypto";
import { chmodSync, existsSync } from "fs";
import inquirer from "inquirer";
import * as path from "path";
import { resolve } from "path";

import { getFFMpegURL, getFFProbeURL } from "./binaries/ffmpeg-download";
import defaultConfig from "./config/default";
import { IConfig, SUPPORTED_IMAGE_EXTENSIONS, SUPPORTED_VIDEO_EXTENSIONS } from "./config/schema";
import { downloadFile } from "./utils/download";
import { logger } from "./utils/logger";
import { configPath } from "./utils/path";

export const defaultPrompts = {
  downloadFFMPEG: true,
  usePassword: process.env.NODE_ENV !== "test",
  useVideoFolders: process.env.NODE_ENV !== "test",
  useImageFolders: process.env.NODE_ENV !== "test",
};

/**
 * @throws
 */
export async function setupFunction(): Promise<IConfig> {
  const {
    downloadFFMPEG,
    usePassword,
    password,
    useVideoFolders,
    videoFolders,
    useImageFolders,
    imageFolders,
  } = await promptSetup();

  const config = JSON.parse(JSON.stringify(defaultConfig)) as IConfig;

  if (downloadFFMPEG) {
    try {
      const { ffmpegPath, ffprobePath } = await downloadFFLibs(configPath());
      config.binaries.ffmpeg = ffmpegPath;
      config.binaries.ffprobe = ffprobePath;
    } catch (err) {
      logger.error("Error downloading ffmpeg, ffprobe");
      throw err;
    }
  }

  if (usePassword) {
    config.auth.password = createHash("sha512").update(password).digest("hex");
  }

  if (useVideoFolders) {
    config.import.videos = videoFolders.map((folder) => ({
      exclude: [],
      include: [],
      extensions: SUPPORTED_VIDEO_EXTENSIONS,
      path: folder,
      enable: true,
    }));
  }

  if (useImageFolders) {
    config.import.images = imageFolders.map((folder) => ({
      exclude: [],
      include: [],
      extensions: SUPPORTED_IMAGE_EXTENSIONS,
      path: folder,
      enable: true,
    }));
  }

  return config;
}

/**
 * Prompts the user for how to setup the config
 *
 * @returns the choices
 */
async function promptSetup() {
  // If testing, skip prompts, return defaults
  if (process.env.NODE_ENV === "test") {
    return {
      ...defaultPrompts,
      password: "",
      videoFolders: [],
      imageFolders: [],
    };
  }

  const downloadFFMPEG = (
    await inquirer.prompt<{ downloadFFMPEG: boolean }>([
      {
        type: "confirm",
        name: "downloadFFMPEG",
        message: "Download FFMPEG binaries?",
        default: defaultPrompts.downloadFFMPEG,
      },
    ])
  ).downloadFFMPEG;

  const { usePassword } = await inquirer.prompt<{ usePassword: boolean }>([
    {
      type: "confirm",
      name: "usePassword",
      message: "Set a password (protect server in LAN)?",
      default: defaultPrompts.usePassword,
    },
  ]);

  let password = "";

  if (usePassword) {
    password = (
      await inquirer.prompt<{ password: string }>([
        {
          type: "password",
          name: "password",
          message: "Enter a password",
        },
      ])
    ).password;

    let confirmPassword;

    do {
      confirmPassword = (
        await inquirer.prompt<{ password: string }>([
          {
            type: "password",
            name: "password",
            message: "Confirm password",
          },
        ])
      ).password;
    } while (password !== confirmPassword);
  }

  const { useVideoFolders } = await inquirer.prompt<{ useVideoFolders: boolean }>([
    {
      type: "confirm",
      name: "useVideoFolders",
      message: "Do you have one or more folders you want to import VIDEOS from?",
      default: defaultPrompts.useVideoFolders,
    },
  ]);

  const videoFolders = [] as string[];

  if (useVideoFolders) {
    let path: string;

    do {
      path = (
        await inquirer.prompt<{ path: string }>([
          {
            type: "input",
            name: "path",
            message: "Enter folder name (enter 'done' when done)",
            default: "done",
          },
        ])
      ).path;

      if (path !== "done") {
        if (existsSync(path)) videoFolders.push(path);
        else logger.error(`Could not find ${path}`);
      }
    } while (path !== "done");
  }

  const { useImageFolders } = await inquirer.prompt<{ useImageFolders: boolean }>([
    {
      type: "confirm",
      name: "useImageFolders",
      message: "Do you have one or more folders you want to import IMAGES from?",
      default: defaultPrompts.useVideoFolders,
    },
  ]);

  const imageFolders = [] as string[];

  if (useImageFolders) {
    let path: string;

    do {
      path = (
        await inquirer.prompt<{ path: string }>([
          {
            type: "input",
            name: "path",
            message: "Enter folder name (enter 'done' when done)",
            default: "done",
          },
        ])
      ).path;

      if (path !== "done") {
        if (existsSync(path)) imageFolders.push(path);
        else logger.error(`Could not find ${path}`);
      }
    } while (path !== "done");
  }

  return {
    downloadFFMPEG,
    usePassword,
    password,
    useVideoFolders,
    videoFolders,
    useImageFolders,
    imageFolders,
  };
}

/**
 * Downloads ffmpeg & ffprobe into the given folder
 *
 * @returns the paths where they were downloaded
 * @throws if one of the downloads failed
 */
export async function downloadFFLibs(
  destFolder: string
): Promise<{ ffmpegPath: string; ffprobePath: string }> {
  const ffmpegURL = getFFMpegURL();
  const ffprobeURL = getFFProbeURL();

  const ffmpegPath = resolve(destFolder, path.basename(ffmpegURL));
  const ffprobePath = resolve(destFolder, path.basename(ffprobeURL));

  await downloadFile(ffmpegURL, ffmpegPath);
  await downloadFile(ffprobeURL, ffprobePath);

  try {
    logger.debug("CHMOD binaries...");
    chmodSync(ffmpegPath, "111");
    chmodSync(ffprobePath, "111");
  } catch (error) {
    logger.error("Could not make FFMPEG binaries executable");
  }

  return { ffmpegPath, ffprobePath };
}
