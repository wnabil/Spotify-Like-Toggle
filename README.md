
# Spotify Like Toggle

**Spotify Like Toggle** is an Electron-based desktop app that provides quick keyboard shortcuts to add or remove the currently playing track on Spotify from your Liked Songs.  

---

## Features

- Runs in the system tray with minimal UI.
- Add or remove the current Spotify track from Liked Songs using global keyboard shortcuts.
- Simple About window with developer contact info.
- Automatic Spotify token refresh.

---

## Shortcuts

- `Ctrl + Alt + A` — Add the current track to Liked Songs  
- `Ctrl + Alt + R` — Remove the current track from Liked Songs  

---

## Installation

1. Clone this repository:

```bash
git clone <repo-url>
cd <repo-folder>
```

2. Install dependencies:

```bash
npm install
```

3. Create a `config.ini` file in the root directory. Example:

```ini
[spotify]
clientId = YOUR_SPOTIFY_CLIENT_ID
clientSecret = YOUR_SPOTIFY_CLIENT_SECRET
redirectUri = YOUR_REDIRECT_URI
```

**Note:** The app will not run without a properly configured `config.ini`.

---

## Usage

Start the app with:

```bash
npm start
```

- The app will run in the system tray.
- Open the **About** window or quit the app from the tray menu.
- On first launch, the app will open a browser window to authorize Spotify.  

---

## Developer Info

**Name:** Wassem Keddah  
**Email:** [wassemkeddah@gmail.com](mailto:wassemkeddah@gmail.com)  
**Company:** [OkToCode](https://ok2code.com)  

---

## Dependencies

- [Electron](https://www.electronjs.org/)
- [Spotify Web API Node](https://github.com/thelinmichael/spotify-web-api-node)
- [node-global-key-listener](https://www.npmjs.com/package/node-global-key-listener)
- [node-notifier](https://www.npmjs.com/package/node-notifier)
- [express](https://expressjs.com/)
- [open](https://www.npmjs.com/package/open)
- [ini](https://www.npmjs.com/package/ini)

---

## Notes

- The app runs silently in the tray with no visible windows.
- Make sure your `redirectUri` in Spotify Developer Dashboard matches the one in `config.ini`.
- For macOS users: the dock icon is hidden automatically.

---

## License

MIT License © OkToCode
