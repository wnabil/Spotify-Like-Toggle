const { app, Tray, Menu, BrowserWindow, shell, nativeImage } = require("electron");
const path = require("path");

let tray = null;
let aboutWin = null;

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
    icon: path.join(__dirname, "icon.png"), // optional
    webPreferences: {
      contextIsolation: true,
      sandbox: true
    }
  });

  // Open external links in default browser
  aboutWin.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

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

  const htmlBase64 = Buffer.from(html).toString("base64");
  aboutWin.loadURL(`data:text/html;base64,${htmlBase64}`);

  aboutWin.once("ready-to-show", () => aboutWin.show());
  aboutWin.on("closed", () => { aboutWin = null; });
}

function createTray() {
  const trayIcon = nativeImage.createFromPath(path.join(__dirname, "icon-small.png"));
  tray = new Tray(trayIcon);

  const menu = Menu.buildFromTemplate([
    { label: "About", click: createAboutWindow },
    { type: "separator" },
    { label: "Quit", click: () => app.quit() }
  ]);

  tray.setToolTip("Spotify Like Toggle");
  tray.setContextMenu(menu);
}

app.whenReady().then(() => {
  createTray();

  // Start your background Spotify script
  require(path.join(__dirname, "spotify-like-toggle.js"));

  // macOS: hide dock icon
  if (app.dock) app.dock.hide();
});

// Keep running with no windows
app.on("window-all-closed", (e) => e.preventDefault());
