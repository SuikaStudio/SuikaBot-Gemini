require("dotenv").config();
const { Client, LocalAuth } = require("whatsapp-web.js");

const osPlatform = require("os").platform();
const execPaths = {
  win32: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  linux: "/usr/bin/chromium-browser",
};

let messageQueues = {};
let isProcessingQueues = {};
let processingPromise = null;

console.log("Environment", process.env.NODE_ENV);
console.log("Running on platform: ", osPlatform);

const client = new Client({
  authStrategy: new LocalAuth(),
  ffmpegPath: require("@ffmpeg-installer/ffmpeg").path,
  puppeteer: {
    executablePath: execPaths[osPlatform] || null,
  },
});

client.on("qr", (qr) => {
  try {
    const qrcode = require("qrcode-terminal");
    qrcode.generate(qr, { small: true });
  } catch (error) {
    console.error("[!] Error: - qr", error);
  }
});

client.on("ready", async () => {
  try {
    console.log("Client is ready!");
  } catch (error) {
    console.error("[!] Error: - ready", error);
  }
});

client.on("auth_failure", (message) => {
  console.log("Authentication failure", message);
});

client.on("message", async (message) => {
  try {
    const processQueue = require("./controller/processQueue");
    const sender = message.from;

    if (!messageQueues[sender]) {
      messageQueues[sender] = [];
      isProcessingQueues[sender] = false;
    }

    messageQueues[sender].push(message);
    if (!isProcessingQueues[sender]) {
      await processQueue(sender);
    }
  } catch (error) {
    console.error("[!] Error: - message", error);
  }
});

client.on("message_revoke_everyone", async (message, revoked_msg) => {
  const sender = message.from;

  try {
    if (messageQueues[sender]) {
      const found = messageQueues[sender].some((queuedMsg, index) => {
        if (queuedMsg.timestamp === revoked_msg.timestamp) {
          messageQueues[sender].splice(index, 1);
          return true;
        }
        return false;
      });

      if (
        found &&
        isProcessingQueues?.[sender] &&
        processingPromise?.[sender]
      ) {
        processingPromise[sender].reject("Proses dibatalkan");
      }
    }
  } catch (error) {
    client.sendMessage(sender, "Terjadi kesalahan saat memproses pesan Anda");
    console.error("[!] Error: - msg_revoke_everyone", error);
  }
});

client.on("call", (call) => {
  try {
    call.reject();
  } catch (error) {
    console.error("Reject call failed:", error.message);
  }
});

client.on("disconnected", (reason) => {
  console.log("Client was logged out: ", reason);
});

// eslint-disable-next-line no-unused-vars
process.on("unhandledRejection", async (reason, promise) => {
  if (
    reason instanceof Error &&
    reason.message.includes(
      "Evaluation failed: TypeError: Cannot read properties of undefined (reading 'unsafe')",
    )
  ) {
    return;
  }
});

client.initialize();

module.exports = {
  client,
  messageQueues,
  isProcessingQueues,
  processingPromise,
};
