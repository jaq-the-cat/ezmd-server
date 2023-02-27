import SpotifyWebApi from 'spotify-web-api-node';
import 'dotenv/config';

let expires_in: number = 3600;
const refresh_early_by = 5; // refresh x seconds earlier

const spotify = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

export async function refreshToken(): Promise<void> {
  console.log("Refreshing token");
  await spotify.clientCredentialsGrant().then((data) => {
    spotify.setAccessToken(data.body.access_token);
    expires_in = data.body.expires_in; // usually returns 3600
  }, (err) => {
    console.log("Something went wrong when retrieving access token", err);
  });
}

export async function autoRefreshToken(): Promise<void> {
  await refreshToken();
  setInterval(refreshToken, expires_in*1000 - refresh_early_by*1000);
}

export default spotify; 
