class ChatbotService {
  constructor({ chatBotRepository, geminiAI }) {
    this.chatBotRepository = chatBotRepository;
    this.geminiAI = geminiAI;
  }

  async main(message) {
    try {
      const sender = message.author ? message.author : message.from

      const body = message.body;
      const media = await message.downloadMedia();  
      const formattedPrompt = this.#formatPrompt(body, media);

      const history = await this.chatBotRepository.getChatHistory(sender);
      const formattedHistory = this.#formatHistory(history);

      const chatResponse = await this.geminiAI.chat(formattedPrompt, formattedHistory);
      await this.chatBotRepository.addChatHistory(sender, { 
        prompt: body,
        attachment: media ? {
          data: media.data,
          mimetype: media.mimetype
        } : null,
        response: chatResponse,
        created: new Date().toISOString()
      });

      message.reply(chatResponse);
    } catch (error) {
      console.error(`[!] Error: - handleChatBot: ${error.message}`);
      message.reply('Failed to process your message, please try again.');
    }
  }

  #formatPrompt(body, media) {
    const textPart = { text: body };
    const filePart = media ? {
      inlineData: {
        data: media.data,
        mimeType: media.mimetype
      }
    } : null;

    return [textPart, filePart].filter(Boolean);
  }

  #formatHistory(history) {
    return history.map(({ prompt, attachment, response }) => [
      {
        role: "model",
        parts: [{ text: response }]
      },
      {
        role: "user",
        parts: this.#formatPrompt(prompt, attachment)
      }
    ]).flat();
  }
}

export default ChatbotService;