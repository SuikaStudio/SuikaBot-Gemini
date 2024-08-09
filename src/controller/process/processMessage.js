const GeminiAI = require("../gemini/GeminiAI");
const ResetChat = require("../resetChat");

const { delay } = require("../../utils/delay");

async function processMessage(message) {
  const body = message.body;
  const chat = await message.getChat();

  try {
    chat.sendStateTyping();
    await delay(process.env.DELAY_TIMER);
    switch (true) {
      case body === "/reset": {
        const resetChat = new ResetChat();
        resetChat.main(message);
        break;
      }

      default: {
        const gemini = new GeminiAI();
        gemini.main(message);
        break;
      }
    }
  } catch (error) {
    console.error("[!] Error: - processMessage", error);
  } finally {
    chat.clearState();
  }
}

module.exports = processMessage;
