import whatsappWebJS from "whatsapp-web.js";

const { MessageMedia } = whatsappWebJS;

class ChatBotService {
  constructor({ chatBotRepository, geminiAI, imageUtils }) {
    this.chatBotRepository = chatBotRepository;
    this.geminiAI = geminiAI;
    this.imageUtils = imageUtils;
  }

  async main(message) {
    try {
      const sender = message.author ? message.author : message.from;

      const body = message.body;
      const media = await message.downloadMedia();

      const formattedPrompt = this.#formatPrompt({
        text: body,
        data: media ? media.data : null,
        mimetype: media ? media.mimetype : null,
      });

      const history = await this.chatBotRepository.getChatHistory(sender);
      const formattedHistory = this.#formatHistory(history);

      const chatResponse = await this.geminiAI.chat(
        formattedPrompt,
        formattedHistory,
      );

      const textPart = chatResponse.find((p) => p.text);
      const imagePart = chatResponse.find((p) => p.inlineData);

      const text = textPart?.text?.trimEnd();
      const image = imagePart?.inlineData?.data;
      const imageMime = imagePart?.inlineData?.mimeType;

      await this.chatBotRepository.addChatHistory(sender, {
        prompt: {
          text: body,
          data: media ? media.data : null,
          mimetype: media ? media.mimetype : null,
        },
        response: {
          text,
          data: image ? await this.imageUtils.compressBase64(image) : null,
          mimetype: imageMime || null,
        },
        created: new Date().toISOString(),
      });

      const mediaPayload = image
        ? new MessageMedia(imageMime || "image/png", image)
        : null;

      message.reply(
        text,
        undefined,
        mediaPayload ? { media: mediaPayload } : undefined,
      );
    } catch (error) {
      console.error(`[!] Error: - handleChatBot: ${error.message}`);
      message.reply("Failed to process your message, please try again.");
    }
  }

  #formatPrompt(payload) {
    const { text, data, mimetype } = payload;

    const textPart = { text };
    const filePart =
      data && mimetype
        ? {
            inlineData: {
              data,
              mimeType: mimetype,
            },
          }
        : null;

    return [textPart, filePart].filter(Boolean);
  }

  #formatHistory(history) {
    return history
      .map(({ prompt, response }) => [
        {
          role: "model",
          parts: this.#formatPrompt(response),
        },
        {
          role: "user",
          parts: this.#formatPrompt(prompt),
        },
      ])
      .flat();
  }
}

export default ChatBotService;
