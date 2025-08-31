/**
 * @file main.js
 * @description Main entry point for the Spotify Like Toggle Electron app.
 *              Handles single-instance lock, system tray, About window, and startup shortcut.
 */

const {
  app,
  Tray,
  Menu,
  BrowserWindow,
  shell,
  nativeImage,
} = require("electron");
const path = require("path");
const fs = require("fs");
const ws = require("windows-shortcuts");

let tray = null;      // Global reference to the system tray
let aboutWin = null;  // Global reference to the About window

// Paths for Windows startup folder and shortcut
const startupDir = path.join(
  process.env.APPDATA,
  "Microsoft\\Windows\\Start Menu\\Programs\\Startup"
);
const shortcutPath = path.join(startupDir, "Spotify Like Toggle.lnk");

// Ensure only one instance of the app is running
const singleLock = app.requestSingleInstanceLock();
if (!singleLock) {
  // If another instance exists, quit this instance
  app.quit();
} else {
  // Focus existing window if a second instance is launched
  app.on("second-instance", () => {
    if (aboutWin) {
      if (aboutWin.isMinimized()) aboutWin.restore();
      aboutWin.focus();
    }
  });

  // Ensure the app shortcut exists in the startup folder
  if (!fs.existsSync(shortcutPath)) {
    ws.create(shortcutPath, {
      target: process.execPath,
      workingDir: __dirname,
      args: "",
    });
  }

  /**
   * Creates and displays the About window.
   * If already open, it focuses and restores it.
   */
  function createAboutWindow() {
    if (aboutWin) {
      if (aboutWin.isMinimized()) aboutWin.restore();
      aboutWin.focus();
      return;
    }

    aboutWin = new BrowserWindow({
      width: 500,
      height: 400,
      resizable: false,
      minimizable: false,
      maximizable: false,
      autoHideMenuBar: true,
      title: "About",
      show: false,
      icon: path.join(__dirname, "icon.png"),
      webPreferences: { contextIsolation: true, sandbox: true },
    });

    // Open external URLs in the system default browser
    aboutWin.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: "deny" };
    });

    // HTML content for About window
    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>About</title>
          <style>
            body { font-family: system-ui, Arial, sans-serif; margin: 0; padding: 16px 18px; color: #111; }
            h1 { font-size: 18px; margin: 0 0 8px; }
            .sub { color:#555; margin-bottom: 16px; }
            h2 { font-size: 14px; margin: 14px 0 8px; }
            ul { margin: 0 0 8px 18px; }
            li { margin: 6px 0; }
            a { color: #0b5fff; text-decoration: none; }
            a:hover { text-decoration: underline; }
            .foot { margin-top: 14px; font-size: 12px; color:#666; }
            code { background:#f4f4f4; padding:2px 4px; border-radius:4px; }
          </style>
        </head>
        <body>
          <h1>Spotify Like Toggle</h1>
          <div class="sub">Quick controls for Liked Songs</div>
          <h2>Shortcuts</h2>
          <ul>
            <li><code>Ctrl</code> + <code>Alt</code> + <code>A</code> — Add current track to Liked Songs</li>
            <li><code>Ctrl</code> + <code>Alt</code> + <code>R</code> — Remove current track from Liked Songs</li>
          </ul>
          <h2>Contact</h2>
          <ul>
            <li>Email: <a href="mailto:wassemkeddah@gmail.com">(Wassem Keddah) wassemkeddah@gmail.com</a></li>
            <li>Company: <a href="https://ok2code.com" target="_blank" rel="noreferrer">OkToCode (ok2code.com)</a></li>
          </ul>
          <div class="foot">© OkToCode</div>
        </body>
      </html>
    `;

    aboutWin.loadURL(
      `data:text/html;base64,${Buffer.from(html).toString("base64")}`
    );
    aboutWin.once("ready-to-show", () => aboutWin.show());
    aboutWin.on("closed", () => {
      aboutWin = null;
    });
  }

  /**
   * Creates the system tray icon and context menu.
   */
  function createTray() {
    const menu = Menu.buildFromTemplate([
      { label: "About", click: createAboutWindow },
      { type: "separator" },
      { label: "Quit", click: () => app.quit() },
    ]);

    if (!tray) {
      const trayIcon = nativeImage.createFromPath(
        path.join(__dirname, "icon-small.png")
      );
      tray = new Tray(trayIcon);
      tray.setToolTip("Spotify Like Toggle");
    }
    tray.setContextMenu(menu);
  }

  // Initialize tray and main app functionality when Electron is ready
  app.whenReady().then(() => {
    createTray();
    require(path.join(__dirname, "spotify-like-toggle.js")); // Main Spotify logic
    if (app.dock) app.dock.hide(); // Hide dock icon on macOS
  });

  // Prevent app from quitting when all windows are closed
  app.on("window-all-closed", (e) => e.preventDefault());
}
