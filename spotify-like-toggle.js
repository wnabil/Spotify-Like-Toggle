/**
 * @file spotify-like-toggle.js
 * @description Handles Spotify authentication, token refresh, and global keyboard shortcuts
 *              for adding/removing currently playing track to/from Liked Songs.
 */

const fs = require("fs");
const path = require("path");
const ini = require("ini");
const SpotifyWebApi = require("spotify-web-api-node");
const { GlobalKeyboardListener } = require("node-global-key-listener");
const open = require("open").default;
const notifier = require("node-notifier");
const express = require("express");

// Path to notification icon
const iconPath = path.join(__dirname, "icon.png");

// --- Load config.ini ---
const configPath = path.join(__dirname, "config.ini");
if (!fs.existsSync(configPath)) throw new Error("config.ini not found!");

const config = ini.parse(fs.readFileSync(configPath, "utf-8"));
const { clientId, clientSecret, redirectUri } = config.spotify;

// Spotify OAuth scopes required for this app
const scopes = [
  "user-library-modify", // Add/remove tracks to/from Liked Songs
  "user-library-read",   // Check if track is already liked
  "user-read-playback-state", // Get current playing track
];

/**
 * Main function: starts the Express server and handles Spotify OAuth flow.
 */
async function main() {
  const port = 8888; // Local server port for Spotify redirect
  const spotifyApi = new SpotifyWebApi({ clientId, clientSecret, redirectUri });
  const app = express();

  /**
   * Spotify redirect callback endpoint.
   * Exchanges authorization code for access and refresh tokens.
   */
  app.get("/callback", async (req, res) => {
    const code = req.query.code;
    if (!code) return res.send("No code received.");

    try {
      const data = await spotifyApi.authorizationCodeGrant(code);
      spotifyApi.setAccessToken(data.body["access_token"]);
      spotifyApi.setRefreshToken(data.body["refresh_token"]);
      console.log("Spotify authenticated! Hotkeys are active.");

      startTokenRefresh(spotifyApi);    // Start periodic token refresh
      startHotkeyListener(spotifyApi);  // Start global hotkey listener

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
    open(authorizeURL); // Open Spotify OAuth in default browser
  });
}

/**
 * Starts an interval to refresh Spotify access token periodically.
 * @param {SpotifyWebApi} spotifyApi
 */
function startTokenRefresh(spotifyApi) {
  setInterval(async () => {
    try {
      const refreshData = await spotifyApi.refreshAccessToken();
      spotifyApi.setAccessToken(refreshData.body["access_token"]);
      console.log("[Token refreshed]");
    } catch (err) {
      console.error("Error refreshing token:", err.message);
    }
  }, 1000 * 60 * 50); // Refresh every 50 minutes
}

/**
 * Starts global keyboard listener for hotkeys Ctrl+Alt+A and Ctrl+Alt+R
 * @param {SpotifyWebApi} spotifyApi
 */
function startHotkeyListener(spotifyApi) {
  const listener = new GlobalKeyboardListener();

  listener.addListener(async (e, down) => {
    // Only process on key down events
    if (e.state !== "DOWN") return;

    const isCtrl = down["LEFT CTRL"] || down["RIGHT CTRL"];
    const isAlt = down["LEFT ALT"] || down["RIGHT ALT"];
    const key = e.name;

    if (isCtrl && isAlt && (key === "A" || key === "R")) {
      try {
        const current = await spotifyApi.getMyCurrentPlayingTrack();
        if (!current.body?.item) {
          notifier.notify({ title: "Spotify Liked Toggle", message: "No track currently playing", icon: iconPath });
          return;
        }

        const trackId = current.body.item.id;
        const songInfo = `${current.body.item.name} - ${current.body.item.artists.map(a => a.name).join(", ")}`;
        const isLiked = (await spotifyApi.containsMySavedTracks([trackId])).body[0];

        if (key === "A") { // Add track
          if (isLiked) {
            notifier.notify({ title: "Spotify Liked Toggle", message: `Already in Liked Songs:\n${songInfo}`, icon: iconPath });
          } else {
            await spotifyApi.addToMySavedTracks([trackId]);
            notifier.notify({ title: "Spotify Liked Toggle", message: `Added to Liked Songs:\n${songInfo}`, icon: iconPath });
          }
        } else if (key === "R") { // Remove track
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

// Start the app
main();
