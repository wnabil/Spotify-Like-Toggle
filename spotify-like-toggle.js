const fs = require("fs");
const path = require("path");
const ini = require("ini");
const SpotifyWebApi = require("spotify-web-api-node");
const { GlobalKeyboardListener } = require("node-global-key-listener");
const open = require("open").default;
const notifier = require("node-notifier");
const express = require("express");

const iconPath = path.join(__dirname, "icon.png");

// Read config.ini
const configPath = path.join(__dirname, "config.ini");
if (!fs.existsSync(configPath)) throw new Error("config.ini not found!");

const config = ini.parse(fs.readFileSync(configPath, "utf-8"));
const { clientId, clientSecret, redirectUri } = config.spotify;

// Spotify scopes
const scopes = [
  "user-library-modify",
  "user-library-read",
  "user-read-playback-state",
];

// --- Main function ---
async function main() {
  const port = 8888;
  const spotifyApi = new SpotifyWebApi({ clientId, clientSecret, redirectUri });
  const app = express();

  app.get("/callback", async (req, res) => {
    const code = req.query.code;
    if (!code) return res.send("No code received.");

    try {
      const data = await spotifyApi.authorizationCodeGrant(code);
      spotifyApi.setAccessToken(data.body["access_token"]);
      spotifyApi.setRefreshToken(data.body["refresh_token"]);
      console.log("Spotify authenticated! Hotkeys are active.");
      startTokenRefresh(spotifyApi);
      startHotkeyListener(spotifyApi);

      res.send(`
        <html>
          <body>
            <p>Spotify authenticated! You can close this page.</p>
            <script>setTimeout(() => window.close(), 1000);</script>
          </body>
        </html>
      `);
    } catch (err) {
      console.error("Error during authorization:", err.message);
      if (!res.headersSent) res.send("Error during authorization. Check console.");
    }
  });

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
    const authorizeURL = spotifyApi.createAuthorizeURL(scopes, "state");
    console.log("Opening Spotify login page...");
    open(authorizeURL);
  });
}

// --- Token refresh ---
function startTokenRefresh(spotifyApi) {
  setInterval(async () => {
    try {
      const refreshData = await spotifyApi.refreshAccessToken();
      spotifyApi.setAccessToken(refreshData.body["access_token"]);
      console.log("[Token refreshed]");
    } catch (err) {
      console.error("Error refreshing token:", err.message);
    }
  }, 1000 * 60 * 50);
}

// --- Hotkey listener ---
function startHotkeyListener(spotifyApi) {
  const listener = new GlobalKeyboardListener();

  listener.addListener(async (e, down) => {
    const isCtrl = down["LEFT CTRL"] || down["RIGHT CTRL"];
    const isAlt = down["LEFT ALT"] || down["RIGHT ALT"];
    const key = e.name;

    if (isCtrl && isAlt && down[key]) {
      try {
        const current = await spotifyApi.getMyCurrentPlayingTrack();
        if (!current.body?.item) {
          notifier.notify({ title: "Spotify Liked Toggle", message: "No track currently playing", icon: iconPath });
          return;
        }

        const trackId = current.body.item.id;
        const songInfo = `${current.body.item.name} - ${current.body.item.artists.map(a => a.name).join(", ")}`;
        const isLiked = (await spotifyApi.containsMySavedTracks([trackId])).body[0];

        if (key === "A") {
          if (isLiked) {
            notifier.notify({ title: "Spotify Liked Toggle", message: `Already in Liked Songs:\n${songInfo}`, icon: iconPath });
          } else {
            await spotifyApi.addToMySavedTracks([trackId]);
            notifier.notify({ title: "Spotify Liked Toggle", message: `Added to Liked Songs:\n${songInfo}`, icon: iconPath });
          }
        } else if (key === "R") {
          if (!isLiked) {
            notifier.notify({ title: "Spotify Liked Toggle", message: `Not in Liked Songs:\n${songInfo}`, icon: iconPath });
          } else {
            await spotifyApi.removeFromMySavedTracks([trackId]);
            notifier.notify({ title: "Spotify Liked Toggle", message: `Removed from Liked Songs:\n${songInfo}`, icon: iconPath });
          }
        }
      } catch (err) {
        notifier.notify({ title: "Spotify Liked Toggle", message: `Error: ${err.message}`, icon: iconPath });
      }
    }
  });

  console.log("Hotkeys:");
  console.log("  Ctrl+Alt+A → Add current track to Liked Songs");
  console.log("  Ctrl+Alt+R → Remove current track from Liked Songs");
}

main();
