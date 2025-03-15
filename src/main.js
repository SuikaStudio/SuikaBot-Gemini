// Import dotenv to load environment variables
require("dotenv").config();

// Import Firebase instance + service account, then initialize the app
const { initializeApp, cert } = require('firebase-admin/app');
const serviceAccount = require('../google-service-account.json');

initializeApp({
  credential: cert(serviceAccount)
});

// Import Dependency Injection Container
const container = require("./di/container");

// Import Wweb.js Client
const { Client, LocalAuth } = require("whatsapp-web.js");

// Get the os platform for setting Wweb.js executable path
const osPlatform = require("os").platform();
const execPaths = {
  win32: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  linux: "/usr/bin/chromium-browser",
};

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

// Initialize the Wweb.js client
const client = new Client({
  authStrategy: new LocalAuth(),
  ffmpegPath: require("@ffmpeg-installer/ffmpeg").path,
  puppeteer: {
    executablePath: execPaths[osPlatform] || null,
  },
});

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

module.exports = { client };
