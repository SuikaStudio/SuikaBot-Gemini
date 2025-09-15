// Load environment variables from .env file
import 'dotenv/config'

// Import necessary modules
import os from "os";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import whatsappWebJS from "whatsapp-web.js";

// Import Dependency Injection Container
import container from "./di/container.js";

// Destructure the necessary classes from whatsapp-web.js
const { Client, LocalAuth } = whatsappWebJS;

// Get the os platform for setting Wweb.js executable path
const osPlatform = os.platform();
const execPaths = {
  win32: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  linux: "/usr/bin/chromium-browser",
};

// Initialize the Wweb.js client
const client = new Client({
  authStrategy: new LocalAuth(),
  ffmpegPath: ffmpegInstaller.path,
  puppeteer: {
    executablePath: execPaths[osPlatform] || null,
  },
});

// Import the controller functions for the client events
const {
  onQr,
  onReady,
  onAuthFailure,
  onMessage,
  onMessageRevokeEveryone,
  onCall,
  onDisconnect,
} = container.resolve("clientHandler");

// Set the client event listeners with the controller functions
client.on("qr", onQr);
client.on("ready", onReady);
client.on("auth_failure", onAuthFailure);
client.on("message", onMessage);
client.on("message_revoke_everyone", onMessageRevokeEveryone);
client.on("call", onCall);
client.on("disconnected", onDisconnect);

process.on("unhandledRejection", () => {});

client.initialize();

// Print the environment and platform to the console, (optional)
console.log("Running on platform:", osPlatform);
console.log("Environment:", process.env.NODE_ENV);