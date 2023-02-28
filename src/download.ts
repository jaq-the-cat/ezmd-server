import ytdl from 'ytdl-core';
import ffmpeg from 'ffmpeg';
import fs from 'fs';
import youtube from '@yimura/scraper'
import {ErrorType, log} from './log';

const yt = new youtube.Scraper();

export async function getYoutubeId(query: string): Promise<string> {
  const results = await yt.search(query);
  log(`getYoutubeId: Got video: ${results.videos[0].title}`);
  return results.videos[0].id;
}

export function downloadFromYoutube(link: string): string {
  const filename = `/tmp/ezmd-${Date.now()}.mp4`;
  ytdl(link, {
    filter: format => format.container === "mp4",
    quality: 'highestaudio', 
  }).pipe(fs.createWriteStream(filename));
  log(`downloadFromYoutube: Downloaded video to: ${filename}`);
  return filename;
}

export async function convertToMp3(filename: string, destFilename: string): Promise<void> {
  log(`convertToMp3: Converting ${filename} to an MP3 file`);
  try {
    const file = await new ffmpeg(filename);
    await file.fnExtractSoundToMP3(destFilename);
    log(`convertToMp3: Converted ${destFilename}`);
  } catch (err: any) {
    log(`(${err.code}) ${err.msg}`, ErrorType.Server);
  }
}
