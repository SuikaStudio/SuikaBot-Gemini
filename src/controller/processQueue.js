let {
  client,
  messageQueues,
  isProcessingQueues,
  processingPromise,
} = require("../main");
const GeminiAI = require("./gemini");
const delay = require("./delay");

async function processQueue(sender) {
  try {
    isProcessingQueues[sender] = true;

    processingPromise = new Promise(async (resolve, reject) => {
      while (messageQueues[sender].length > 0) {
        const gemini = new GeminiAI();

        const message = messageQueues[sender].shift();
        const chat = await message.getChat();

        await delay(process.env.DELAY_TIMER);
        
        chat.sendStateTyping();
        await gemini.main(message);
        chat.clearState();
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
