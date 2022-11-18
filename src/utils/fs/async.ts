import { copyFile, mkdir, mkdirSync, readdir, readFile, rmdir, stat, unlink, writeFile } from "fs";
import { promisify } from "util";

export const statAsync = promisify(stat);
export const unlinkAsync = promisify(unlink);
export const readdirAsync = promisify(readdir);
export const readFileAsync = promisify(readFile);
export const writeFileAsync = promisify(writeFile);
export const copyFileAsync = promisify(copyFile);
export const rmdirAsync = promisify(rmdir);
export const mkdirAsync = promisify(mkdir);

export function rimrafAsync(path: string): Promise<void> {
  return rmdirAsync(path, { recursive: true });
}

export function mkdirpSync(path: string): string {
  return mkdirSync(path, { recursive: true })!;
}
