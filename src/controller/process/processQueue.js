let {
  client,
  messageQueues,
  isProcessingQueues,
  processingPromise,
} = require("../../main");
const processMessage = require("./processMessage");

async function processQueue(sender) {
  try {
    isProcessingQueues[sender] = true;

    processingPromise = new Promise(async (resolve, reject) => {
      while (messageQueues[sender].length > 0) {
        const message = messageQueues[sender].shift();
        await processMessage(message);
      }
      resolve();

      if (messageQueues[sender].length > 0) {
        await processQueue(sender);
      }

      delete messageQueues[sender];
    });
    await processingPromise.catch((error) => {
      console.error("Processing promise rejected:", error);
    });
  } catch (error) {
    console.error("[!] Error: - processQueue", error);
    client.sendMessage(sender, "Terjadi kesalahan saat memproses pesan Anda");
  } finally {
    delete isProcessingQueues[sender];
    isProcessingQueues[sender] = false;
  }
}

module.exports = processQueue;
