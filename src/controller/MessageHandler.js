import { delay } from "../utils/delay.js";

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
    const body = message.body.trim();

    if (body.startsWith("/")) {
      switch (body) {
        case "/reset":
          await this.resetChatService.main(message);
          break;

        default:
          await message.reply("❌ Command not found");
          break;
      }
      return;
    }

    await this.chatBotService.main(message);
  }
}

export default MessageHandler;
