import SpotifyWebApi from 'spotify-web-api-node';

let expires_in: number = 3600;
const refresh_early_by = 5; // refresh x seconds earlier

const spotify = new SpotifyWebApi({
  clientId: 'ca9dd04a17c64ac5ad8b3fe6352e9288',
  clientSecret: '431feb9a65444066892bee80272cf5f3' ,
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

//setInterval(refreshToken, expires_in*1000 - refresh_early_by*1000);

export default spotify; 
