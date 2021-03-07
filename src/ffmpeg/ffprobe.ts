import { readFirstNBytes } from "../utils/misc";

export enum FFProbeContainers {
  // FFprobe cannot differentiate between these, but it does not matter
  // in the browser
  MP4 = "mov,mp4,m4a,3gp,3g2,mj2",
  M4V = "mov,mp4,m4a,3gp,3g2,mj2",
  MOV = "mov,mp4,m4a,3gp,3g2,mj2",

  // Other streamable/transcodable containers

  // FFprobe cannot differentiate mkv/webm, we'll have to do it manually
  MKV = "matroska",
  WEBM = "matroska,webm",

  AVI = "avi",
  WMV = "asf",
  FLV = "flv",
  MPEGTS = "mpegts",
}

/**
 * @param filepath - path to the file
 * @returns the specific matroska container: mkv or webm
 */
export async function getMatroskaContainer(
  filepath: string
): Promise<FFProbeContainers.MKV | FFProbeContainers.WEBM | null> {
  const fileBuff: Buffer | null = await readFirstNBytes(filepath, 4096);
  if (!fileBuff) {
    return null;
  }

  // Matroska signature https://en.wikipedia.org/wiki/List_of_file_signatures
  const isMatroska =
    fileBuff.length > 3 &&
    fileBuff[0] === 0x1a &&
    fileBuff[1] === 0x45 &&
    fileBuff[2] === 0xdf &&
    fileBuff[3] === 0xa3;
  if (!isMatroska) {
    return null;
  }

  function isMatroskaSubtype(buff: Buffer, subtype: string): boolean {
    // https://github.com/h2non/filetype/blob/29039c24a9fbddaf40b7ae847d38f7ceafb94dd0/matchers/video.go#L133
    const indexOfSubtype = buff.indexOf(subtype);
    if (indexOfSubtype < 3) {
      return false;
    }
    return buff[indexOfSubtype - 3] === 0x42 && buff[indexOfSubtype - 2] === 0x82;
  }

  if (isMatroskaSubtype(fileBuff, "webm")) {
    return FFProbeContainers.WEBM;
  }

  if (isMatroskaSubtype(fileBuff, "matroska")) {
    return FFProbeContainers.MKV;
  }

  return null;
}

/**
 * FFprobe cannot differentiate webm from normal mkv, so if ffprobe
 * gives a webm container, we need to manually check if it's mkv or webm
 *
 * @param formatName - ffprobe format name
 * @param filepath - path to the file
 * @returns the correct container
 */
export async function normalizeFFProbeContainer(
  formatName: FFProbeContainers,
  filepath: string
): Promise<FFProbeContainers | null> {
  if (formatName === FFProbeContainers.WEBM) {
    return getMatroskaContainer(filepath);
  }

  return formatName;
}

export enum FFProbeVideoCodecs {
  H264 = "h264",
  H265 = "h265",
  HEVC = "hevc", // same as h265
  VP8 = "vp8",
  VP9 = "vp9",
}

export enum FFProbeAudioCodecs {
  AAC = "aac",
  VORBIS = "vorbis",
  OPUS = "opus",
  MP3 = "mp3",
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PartialRecord<K extends keyof any, T> = Partial<Record<K, T>>;

/**
 * Map of containers and their supported codecs **in the browser**
 *
 * The table does not contain all the supported ffprobe containers because the rest
 * have to be transcoded anyways
 * @see
 * - https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Video_codecs
 * - https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Audio_codecs
 */
const BrowserCodecCompatMap: PartialRecord<
  FFProbeContainers,
  { videoCodecs: FFProbeVideoCodecs[]; audioCodecs: FFProbeAudioCodecs[]; mimeType: string }
> = {
  [FFProbeContainers.MP4]: {
    videoCodecs: [FFProbeVideoCodecs.H264, FFProbeVideoCodecs.H265, FFProbeVideoCodecs.VP9],
    audioCodecs: [FFProbeAudioCodecs.AAC, FFProbeAudioCodecs.MP3, FFProbeAudioCodecs.OPUS],
    mimeType: "video/mp4",
  },
  [FFProbeContainers.MKV]: {
    videoCodecs: [
      FFProbeVideoCodecs.H264,
      FFProbeVideoCodecs.H265,
      FFProbeVideoCodecs.VP8,
      FFProbeVideoCodecs.VP9,
    ],
    audioCodecs: [
      FFProbeAudioCodecs.VORBIS,
      FFProbeAudioCodecs.OPUS,
      FFProbeAudioCodecs.AAC,
      FFProbeAudioCodecs.MP3,
    ],
    mimeType: "video/mp4",
  },
  [FFProbeContainers.WEBM]: {
    videoCodecs: [FFProbeVideoCodecs.VP8, FFProbeVideoCodecs.VP9],
    audioCodecs: [FFProbeAudioCodecs.VORBIS, FFProbeAudioCodecs.OPUS],
    mimeType: "video/webm",
  },
};

/**
 *
 * @param container - ffprobe container
 * @returns the mime type of the container, if it has codecs that can be played **in the browser**
 */
export const getDirectPlayMimeType = (container: FFProbeContainers): string =>
  BrowserCodecCompatMap[container]?.mimeType || "";

/**
 * @param container - file container
 * @param videoCodec - codec of the video
 * @returns if the video codec inside the container can be played **in the browser**
 */
export const videoIsValidForContainer = (
  container: FFProbeContainers,
  videoCodec: FFProbeVideoCodecs
): boolean => BrowserCodecCompatMap[container]?.videoCodecs.includes(videoCodec) || false;

/**
 * @param container - file container
 * @param videoCodec - codec of the audio
 * @returns if the audio codec inside the container can be played **in the browser**
 */
export const audioIsValidForContainer = (
  container: FFProbeContainers,
  audioCodec: FFProbeAudioCodecs
): boolean => BrowserCodecCompatMap[container]?.audioCodecs.includes(audioCodec) || false;
