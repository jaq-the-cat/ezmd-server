import fs from 'fs'
import express from 'express';
import {convertToMp3, downloadFromYoutube, getYoutubeId} from './download';
import { log } from './log';
import { autoRefreshToken } from './spotify';
import { addMetadataToFile, getYoutubeQueryString, getTrackByQuery, getTrackById, getPlaylistTracks, Track } from './tags';

//import http from 'http';
//import https from 'https';

export const app = express();

/**
 * API Usage:
 *  /query?title=<titulo musica>(&ytlink=<link youtube>)
 *    - Returns MP3 File with tags
 *  /link?spotify=<link spotify song>(&ytlink=<link youtube>)
 *    - Returns MP3 File with tags
 *  /playlist?link=<link spotify playlist>
 *    - Returns list of download links to every file in the playlist
 **/

async function downloadFile(track: Track, ytlink: string): Promise<string> {
  const filename = downloadFromYoutube(ytlink as string);
  const mp3Filename = filename.replace(".mp4", ".mp3");
  // convert to mp3
  await convertToMp3(filename, mp3Filename);
  // add tags
  await addMetadataToFile(filename, track);
  fs.unlink(filename, () => {});
  return mp3Filename;
}

app.get("/download/query", async (req, res) => {
  // get track spotify metadata
  const query: string = req.query.title as string;
  const track = await getTrackByQuery(query);
  log(`Downloading ${query}`)

  // get youtube link
  let ytlink: string | undefined = req.query.ytlink as string | undefined;
  const ytQuery = getYoutubeQueryString(track);
  if (!ytlink)
    ytlink = await getYoutubeId(ytQuery);
  if (!ytlink)
    return res.send({ error: true });

  log(`Got ${track.name} by ${track.artists[0]} and ${ytlink}`);

  const filename = await downloadFile(track, ytlink as string);
  res.download(filename, `${track.name}.mp3`);
});

app.get("/download/link", async (req, res) => {
  // get track spotify metadata
  const spotifyLink = req.query.spotify as string;
  const track = await getTrackById(spotifyLink);

  // get youtube link
  let ytlink: string | undefined = req.query.ytlink as string | undefined;
  const ytQuery = getYoutubeQueryString(track);
  if (!ytlink)
    ytlink = await getYoutubeId(ytQuery);
  if (!ytlink)
    return res.send({error: true});

  const filename = await downloadFile(track, ytlink as string);
  res.download(filename, `${track.name}.mp3`);
});

app.get("/download/playlist", async (req, res) => {
  const link = req.query.link as string;
  const tracks = await getPlaylistTracks(link);
  res.send({
    tracks: tracks.map((track) => track.href),
  });
});

// run production
//http.createServer(app).listen(80);
//https.createServer({ ... }, app).listen(443);

// run dev
const PORT = process.env.PORT || 5000;
autoRefreshToken().then(() => {
  app.listen(PORT, () => {
    return console.log(`Server started on ${PORT}`);
  })
});
