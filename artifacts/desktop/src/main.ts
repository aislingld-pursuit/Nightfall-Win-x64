import { app, BrowserWindow } from "electron";
import path from "path";
import net from "net";
import { startServer } from "./server";

function getFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.listen(0, "127.0.0.1", () => {
      const addr = srv.address() as net.AddressInfo;
      srv.close(() => resolve(addr.port));
    });
    srv.on("error", reject);
  });
}

let mainWindow: BrowserWindow | null = null;

async function createWindow() {
  const port = await getFreePort();

  const staticDir = app.isPackaged
    ? path.join(process.resourcesPath, "public")
    : path.resolve(__dirname, "../../nuclear-escape/dist/public");

  await startServer(port, staticDir);

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    title: "Nuclear Force",
    autoHideMenuBar: true,
  });

  mainWindow.loadURL(`http://127.0.0.1:${port}`);
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  app.quit();
});

app.on("activate", () => {
  if (!mainWindow) createWindow();
});
