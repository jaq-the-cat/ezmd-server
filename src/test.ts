import { convertToMp3, downloadFromYoutube, getYoutubeId } from "./download";
import { refreshToken } from "./spotify";
import { addMetadataToFile, getTrackByQuery, getYoutubeQueryString, Track } from "./tags";
import fs from 'fs';

async function downloadFile(track: Track, ytlink: string): Promise<string> {
  const filename = await downloadFromYoutube(ytlink as string);
  const mp3Filename = filename.replace(".mp4", ".mp3");
  // convert to mp3
  await convertToMp3(filename, mp3Filename);
  // add tags
  await addMetadataToFile(mp3Filename, track);
  // delete tmp files
  fs.unlink(filename, () => {});
  return mp3Filename;
}

async function main() {
  await refreshToken();
  const query = "imagine dragons radioactive";
  let track: Track;
  try {
    track = await getTrackByQuery(query);
  } catch (e) {
    console.error(e);
    return;
  }

  // get youtube link
  let ytlink: string | undefined = undefined;
  const ytQuery = getYoutubeQueryString(track);
  if (!ytlink)
    ytlink = await getYoutubeId(ytQuery);
  if (!ytlink) {
    console.error("feck");
    return;
  }

  const filename = await downloadFile(track, ytlink as string);
  console.log(filename);
}

main();
