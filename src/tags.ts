import spotify from './spotify';
import {ErrorType, log} from './log';
import NodeID3 from 'node-id3';

function toTitleCase(str: string) {
  return str.replace(
    /\w\S*/g,
    function(str: string) {
      return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
    }
  );
}

export type Track = SpotifyApi.TrackObjectFull;
export type SimpleArtist = SpotifyApi.ArtistObjectSimplified;

export async function getTrackByQuery(query: string): Promise<Track> {
  const response = await spotify.searchTracks(query, { limit: 1 });
  return response.body.tracks!.items[0];
}

export async function getTrackById(trackId: string): Promise<Track> {
  return (await spotify.getTrack(trackId)).body;
}

export async function getPlaylistTracks(playlistId: string): Promise<Track[]> {
  const playlist = (await spotify.getPlaylist(playlistId)).body;
  return playlist.tracks.items
    .filter(item => (item.track as Track).type === "track")
    .map((item) => item.track as Track);
}

async function getGenre(track: Track): Promise<string> {
  // try getting from album
  const album = await spotify.getAlbum(track.album.id);
  if (album.body.genres.length > 0)
    return toTitleCase(album.body.genres[0]);
  // try getting from artist
  const artist = await spotify.getArtist(track.artists[0].id);
  if (artist.body.genres.length > 0)
    return toTitleCase(artist.body.genres[0]);
  // give up ):
  return "Unclassified";
}

function artistsToString(artists: SimpleArtist[]): string {
  return artists.map(artist => artist.name).join(", ");
}

async function getAlbumArt(track: Track): Promise<Response> {
  return fetch(track.album.images[0].url)
}

export async function addMetadataToFile(filename: string, track: Track) {
  log(`Adding metadata to ${filename}`);
  const artResponse = await getAlbumArt(track);
  let tags = {
    title: track.name,
    album: track.album.name,
    artist: artistsToString(track.artists),
    track: track.track_number,
    genre: await getGenre(track),
    year: track.album.release_date.substring(0, 4),
    image: {
      mime: artResponse.headers.get("Content-Type") as string,
      type: { id: 3 },
      description: "Cover Art",
      imageBuffer: Buffer.from(await artResponse.arrayBuffer()),
    },
  }
  try {
    NodeID3.write(tags, filename);
    log(`Done`);
  } catch (e: any) {
    log(`${e.code} ${e.message ?? e.msg}`, ErrorType.Server);
  }
}

export function getYoutubeQueryString(track: Track): string {
  return `${artistsToString(track.artists)} - ${track.name}`;
}
