const { delay } = require("../utils/delay");

class MessageHandler {
  constructor({ resetChat, gemini }) {
    this.resetChat = resetChat;
    this.gemini = gemini;
  }

  async main(message) {
    const body = message.body;
    const chat = await message.getChat();

    try {
      chat.sendStateTyping();
      await delay(process.env.DELAY_TIMER);

      await this.commannd(body);
    } catch (error) {
      console.error("[!] Error: - processMessage", error);
    } finally {
      chat.clearState();
    }
  }

  async commannd(body) {
    switch (true) {
      case body === "/reset": {
        this.resetChat.main(body);
        break;
      }

      default: {
        this.gemini.main(body);
        break;
      }
    }
  }
}

module.exports = MessageHandler;
