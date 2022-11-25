import { Dirent } from "fs";
import { basename, join, resolve } from "path";

import { handleError, logger } from "../logger";
import { getExtension } from "../string";
import { readdirAsync, statAsync } from "./async";

function pathIsIncluded(path: string, include: string[] = []): boolean {
  if (!include.length) {
    return true;
  }
  return include.some((regStr) => new RegExp(regStr).test(path));
}

function pathIsExcluded(path: string, exclude: string[] = []): boolean {
  if (!exclude.length) {
    return false;
  }
  return exclude.some((regStr) => new RegExp(regStr).test(path));
}

function extensionIsIncluded(path: string, exts: string[] = []): boolean {
  if (!exts) {
    return true;
  }
  return exts.map((x) => x.toLowerCase()).includes(getExtension(path).toLowerCase());
}

export interface IWalkOptions {
  dir: string;
  extensions?: string[];
  include?: string[];
  exclude?: string[];
  /**
   * Return a truthy value to stop the walk. The return value will be the
   * path passed to the callback.
   */
  cb: (file: string) => void | Promise<void | unknown> | unknown;
}

/**
 * If the callback returns a truthy value, the walk will be stopped
 * and the value will be returned. Otherwise, the full stack will be walked
 *
 * @param options - walk options
 * @returns the first path where a truthy value was returned by the callback, or void
 */
export async function walk(options: IWalkOptions): Promise<void | string> {
  const root = resolve(options.dir);

  const folderStack = [] as string[];
  folderStack.push(root);

  while (folderStack.length) {
    const top = folderStack.pop();
    if (!top) {
      break;
    }

    logger.debug(`Walking folder ${top}`);
    let filesInDir: Dirent[] = [];

    try {
      filesInDir = await readdirAsync(top, { withFileTypes: true });
    } catch (err) {
      logger.error(`Error reading contents of directory "${top}", skipping`);
      logger.error(err);
      continue;
    }

    for (const file of filesInDir) {
      const filename = file.name;
      const path = resolve(top, filename);

      if (
        !pathIsIncluded(path, options.include) ||
        pathIsExcluded(path, options.exclude) ||
        basename(path).startsWith(".")
      ) {
        logger.silly(`"${path}" is excluded, skipping`);
        continue;
      }

      try {
        const stat = await statAsync(path);
        if (stat.isDirectory()) {
          logger.debug(`Pushed folder ${path}`);
          folderStack.push(path);
        } else if (extensionIsIncluded(filename, options.extensions)) {
          logger.silly(`Found file ${file}`);
          const res = await options.cb(path);
          if (res) {
            return path;
          }
        }
      } catch (err) {
        const _err = err as Error & { code: string };
        // Check if error was an fs permission error
        if (_err.code && (_err.code === "EACCES" || _err.code === "EPERM")) {
          logger.warn(`"${path}" requires elevated permissions, skipping`);
        } else {
          handleError(`Error walking or in callback for "${path}", skipping`, err);
        }
      }
    }
  }
}
