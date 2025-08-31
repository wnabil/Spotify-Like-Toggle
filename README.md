# Spotify Like Toggle

**Spotify Like Toggle** is an Electron-based desktop app that provides quick keyboard shortcuts to add or remove the currently playing track on Spotify from your Liked Songs.

---

## Features

* Runs in the system tray with minimal UI.
* Add or remove the current Spotify track from Liked Songs using global keyboard shortcuts.
* Simple About window with developer contact info.
* Automatic Spotify token refresh.
* Automatically launch when you log in after first run. You can disable this from task manager Startup tab.

---

## Shortcuts

* `Ctrl + Alt + A` — Add the current track to Liked Songs
* `Ctrl + Alt + R` — Remove the current track from Liked Songs

---

## Installation

1. Clone this repository:

```bash
git clone https://github.com/wnabil/Spotify-Like-Toggle
cd Spotify-Like-Toggle
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
redirectUri = https://spotify.ok2code.com/callback # Or your domain redirection callback
```

**Note:** The app will not run without a properly configured `config.ini`.

---

## Download Latest Release

You can download the prebuilt app for Windows from the latest release:

* [Download Latest Release](https://github.com/wnabil/Spotify-Like-Toggle/releases/latest/download/Spotify-Like-Toggle-Setup.zip)

---

## Usage

You can use the following npm scripts to run, package, and prepare the Windows build of **Spotify Like Toggle**:

### Start the app (development mode)
```bash
npm start
```
- Runs the app in the system tray.
- Open the **About** window or quit the app from the tray menu.
- On first launch, the app will open a browser window to authorize Spotify.

### Package the app for Windows
```bash
npm run package-win
```
- Uses `electron-packager` to build a Windows x64 executable in the `dist` folder.
- Output folder: `dist/SpotifyLikeToggle-win32-x64`

### Create a ZIP of the Windows build
```bash
npm run zip-win
```
- Runs `zip-dist.js` to generate `Spotify-Like-Toggle-Setup.zip` in the `dist` folder.

### Build and ZIP the Windows version
```bash
npm run build-win
```
- Combines packaging and zipping in a single step.
- Produces `dist/Spotify-Like-Toggle-Setup.zip` ready for distribution.
---

## Developer Info

- **Name:** Wassem Keddah
- **Email:** [wassem@ok2code.com](mailto:wassem@ok2code.com)
- **Company:** [OkToCode](https://ok2code.com)

---

## Dependencies

* [Electron](https://www.electronjs.org/)
* [Spotify Web API Node](https://github.com/thelinmichael/spotify-web-api-node)
* [node-global-key-listener](https://www.npmjs.com/package/node-global-key-listener)
* [node-notifier](https://www.npmjs.com/package/node-notifier)
* [express](https://expressjs.com/)
* [open](https://www.npmjs.com/package/open)
* [ini](https://www.npmjs.com/package/ini)

---

## Notes

* The app runs silently in the tray with no visible windows.
* Make sure your `redirectUri` in Spotify Developer Dashboard matches the one in `config.ini`.
* For macOS users: the dock icon is hidden automatically.

---

## License

MIT License © OkToCode
