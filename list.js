import fetch from "node-fetch";

const clientId = "31stc7lzbqq5fof6gkzevfcjfze4";       
const clientSecret = "          ligma              "; 


// -----------------------------------------------------------
// Function: getAccessToken
// Purpose: Authenticate with Spotify and obtain an access token
// The token is required to make requests to Spotify's API
// -----------------------------------------------------------
async function getAccessToken() {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": "Basic " + Buffer.from(clientId + ":" + clientSecret).toString("base64")
    },
    body: "grant_type=client_credentials"
  });

  const data = await res.json();
  return data.access_token;
}

// fetch
async function getPlaylistTracks(playlistUrl, accessToken) {
  const playlistId = playlistUrl.split("/").pop().split("?")[0];
  let url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;

  const headers = { Authorization: `Bearer ${accessToken}` };

  let allTracks = [];

  while (url) {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      throw new Error(`Spotify API error ${res.status}: ${await res.text()}`);
    }

    const data = await res.json();

    for (const item of data.items) {
      const track = item.track;
      if (!track) continue;

      const artists = track.artists.map(a => a.name).join(", ");

      allTracks.push({
        name: track.name,
        artists,
        album: track.album.name,
        release_date: track.album.release_date,
        duration_ms: track.duration_ms,
        preview_url: track.preview_url
      });
    }

    url = data.next;
  }

  return allTracks;
}

//my playlist
(async () => {
  const playlistLink = "https://open.spotify.com/playlist/3KSnCtd8A8jR416MDruUnt?si=81abdcaab44b40fc";

  try {
    const token = await getAccessToken();
    console.log("Access Token:", token);

    const tracks = await getPlaylistTracks(playlistLink, token);

    tracks.forEach((t, i) => {
      console.log(`${i + 1}. ${t.name} — ${t.artists} (Album: ${t.album}, Released: ${t.release_date})`);
    });
  } catch (err) {
    console.error("Error:", err.message);
  }
})();
