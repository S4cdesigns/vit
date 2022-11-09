import * as zod from "zod";

import { StringMatcherSchema } from "../matching/stringMatcher";
import { WordMatcherSchema } from "../matching/wordMatcher";

const logLevelType = zod.enum(["error", "warn", "info", "http", "verbose", "debug", "silly"]);

const pluginArguments = zod.record(zod.unknown());

const pluginSchema = zod.object({
  path: zod.string(),
  logLevel: logLevelType.optional(),
  args: pluginArguments.optional(),
});

const pluginCallWithArgument = zod.tuple([zod.string(), pluginArguments]);

export const ApplyActorLabelsEnum = zod.enum([
  "event:actor:create",
  "event:actor:update",
  "event:actor:find-unmatched-scenes",
  "plugin:actor:create",
  "plugin:actor:custom",
  "event:scene:create",
  "event:scene:update",
  "plugin:scene:create",
  "plugin:scene:custom",
  "event:image:create",
  "event:image:update",
  "plugin:marker:create",
  "event:marker:create",
]);

export const ApplyStudioLabelsEnum = zod.enum([
  "event:studio:create",
  "event:studio:update",
  "event:studio:find-unmatched-scenes",
  "plugin:studio:create",
  "plugin:studio:custom",
  "event:scene:create",
  "event:scene:update",
  "plugin:scene:create",
  "plugin:scene:custom",
]);

export const HardwareAccelerationDriver = zod.enum([
  "qsv",
  "vaapi",
  "nvenc",
  "cuda",
  "amf",
  "videotoolbox",
]);

export const H264Preset = zod.enum([
  "ultrafast",
  "superfast",
  "veryfast",
  "faster",
  "fast",
  "medium",
  "slow",
  "slower",
  "veryslow",
]);

export const WebmDeadline = zod.enum(["good", "best", "realtime"]);

export const SUPPORTED_VIDEO_EXTENSIONS = [
  ".m4v",
  ".mp4",
  ".mov",
  ".wmv",
  ".avi",
  ".mpg",
  ".mpeg",
  ".rmvb",
  ".rm",
  ".flv",
  ".asf",
  ".mkv",
  ".webm",
];

export const SUPPORTED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif"];

const videoImportFolderSchema = zod.object({
  path: zod.string().min(1),
  include: zod.array(zod.string().min(1)),
  exclude: zod.array(zod.string().min(1)),
  extensions: zod.array(zod.string().refine((x) => SUPPORTED_VIDEO_EXTENSIONS.includes(x))),
  enable: zod.boolean(),
});

const imageImportFolderSchema = zod.object({
  path: zod.string().min(1),
  include: zod.array(zod.string().min(1)),
  exclude: zod.array(zod.string().min(1)),
  extensions: zod.array(zod.string().refine((x) => SUPPORTED_IMAGE_EXTENSIONS.includes(x))),
  enable: zod.boolean(),
});

const configSchema = zod
  .object({
    imagemagick: zod.object({
      convertPath: zod.string(),
      identifyPath: zod.string(),
      montagePath: zod.string(),
    }),
    search: zod.object({
      host: zod.string(),
      version: zod.string(),
      log: zod.boolean(),
      auth: zod.string().optional().nullable(),
    }),
    import: zod.object({
      videos: zod.array(videoImportFolderSchema),
      images: zod.array(imageImportFolderSchema),
      scanOnStartup: zod.boolean(),
      scanInterval: zod.number().min(0),
    }),
    processing: zod.object({
      doProcessing: zod.boolean(),
      generateScreenshots: zod.boolean(),
      generatePreviews: zod.boolean(),
      screenshotInterval: zod.number().min(0),
      readImagesOnImport: zod.boolean(),
      imageCompressionSize: zod.number().min(60),
      generateImageThumbnails: zod.boolean(),
    }),
    persistence: zod.object({
      libraryPath: zod.string(),
      backup: zod.object({
        enable: zod.boolean(),
        maxAmount: zod.number().min(0),
      }),
    }),
    binaries: zod.object({
      ffmpeg: zod.string(),
      ffprobe: zod.string(),
      izzyPort: zod.number().min(1).max(65535),
    }),
    auth: zod.object({
      password: zod.string().nullable(),
    }),
    server: zod.object({
      port: zod.number().min(1).max(65535),
      https: zod.object({
        enable: zod.boolean(),
        key: zod.string().nullable(),
        certificate: zod.string().nullable(),
      }),
    }),
    matching: zod.object({
      applySceneLabels: zod.boolean(),
      applyActorLabels: zod.array(ApplyActorLabelsEnum),
      applyStudioLabels: zod.array(ApplyStudioLabelsEnum),
      extractSceneActorsFromFilepath: zod.boolean(),
      extractSceneLabelsFromFilepath: zod.boolean(),
      extractSceneMoviesFromFilepath: zod.boolean(),
      extractSceneStudiosFromFilepath: zod.boolean(),
      matcher: zod.union([StringMatcherSchema, WordMatcherSchema]),
      matchCreatedActors: zod.boolean(),
      matchCreatedStudios: zod.boolean(),
      matchCreatedLabels: zod.boolean(),
    }),
    plugins: zod.object({
      register: zod.record(pluginSchema),
      // Map event name to plugin sequence
      events: zod.record(
        zod.array(
          zod.union([
            // Plugin name only
            zod.string(),
            // Plugin name + arguments [name, { args }]
            pluginCallWithArgument,
          ])
        )
      ),

      allowSceneThumbnailOverwrite: zod.boolean(),
      allowActorThumbnailOverwrite: zod.boolean(),
      allowMovieThumbnailOverwrite: zod.boolean(),
      allowStudioThumbnailOverwrite: zod.boolean(),

      createMissingActors: zod.boolean(),
      createMissingStudios: zod.boolean(),
      createMissingLabels: zod.boolean(),
      createMissingMovies: zod.boolean(),

      markerDeduplicationThreshold: zod.number(),
    }),
    log: zod.object({
      level: logLevelType,
      maxSize: zod.union([zod.number().min(0), zod.string()]),
      maxFiles: zod.union([zod.number().min(0), zod.string()]),
      writeFile: zod.array(
        zod.object({
          level: logLevelType,
          prefix: zod.string(),
          silent: zod.boolean(),
        })
      ),
    }),
    transcode: zod.object({
      hwaDriver: HardwareAccelerationDriver.nullable(),
      vaapiDevice: zod.string().nullable(),
      h264: zod.object({
        preset: H264Preset,
        crf: zod.number().min(0).max(51),
      }),
      webm: zod.object({
        deadline: WebmDeadline,
        cpuUsed: zod.number(),
        crf: zod.number().min(0).max(63),
      }),
    }),
  })
  .passthrough();

export type IPlugin = zod.TypeOf<typeof pluginSchema>;
export type IConfig = zod.TypeOf<typeof configSchema>;

export function isValidConfig(val: unknown) {
  return configSchema.safeParse(val);
}
