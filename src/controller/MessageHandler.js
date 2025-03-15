const { delay } = require("../utils/delay");

class MessageHandler {
  constructor({ chatBotService, resetChatService }) {
    this.chatBotService = chatBotService;
    this.resetChatService = resetChatService;
  }

  async main(message) {
    const chat = await message.getChat();

    try {
      if (!chat.isMuted) {
        chat.mute();
      }
      
      if (chat.isGroup && !chat.archived) {
        chat.archive();
      }

      chat.sendStateTyping();

      await delay(process.env.DELAY_TIMER);
      await this.#processMessage(message);
    } catch (error) {
      console.error("[!] Error: - processMessage", error);
    } finally {
      chat.clearState();
    }
  }

  async #processMessage(message) {
    const body = message.body;

    switch (body) {
      case "/reset":
        await this.chatBotService.main(message);
        break;

      default:
        await this.resetChatService.main(message);
        break;
      }
  }
}

module.exports = MessageHandler;
