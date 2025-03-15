class ResetChatService {
  constructor({ chatBotRepository }) {
    this.chatBotRepository = chatBotRepository;
  }

  async main(message) {
    try {
      const sender = message.from;

      const history = await this.chatBotRepository.deleteChatHistory(sender);
      if (!history) {
        message.reply('Chat history is already empty.');
        return;
      }

      message.reply("Chat history has been reset.");
    } catch (error) {
      console.error(`[!] Error: - handleResetChat: ${error.message}`);
      message.reply('Failed to reset chat history, please try again.');
    }
  }
}

module.exports = ResetChatService;