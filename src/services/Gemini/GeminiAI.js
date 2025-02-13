const VertexAIHandler = require("./VertexAIHandler");
const HistoryManager = require("./HistoryManager");
const MessageHandler = require("./MessageHandler");
const ErrorHandler = require("./ErrorHandler");

class GeminiAI {
  constructor() {
    this.vertexAIHandler = new VertexAIHandler();
    this.db = require("../../db/connection");
    this.historyManager = new HistoryManager(this.db);
    this.messageHandler = new MessageHandler(
      this.vertexAIHandler.generativeModel,
    );
    this.errorHandler = new ErrorHandler();
  }

  async main(message) {
    try {
      const user = message.author ? message.author : message.from;
      const prompt = message.body;
      const media = message.hasMedia
        ? await message.downloadMedia()
        : undefined;

      const history = await this.historyManager.getHistory(user);
      const startChat = this.vertexAIHandler.generativeModel.startChat({
        history,
      });

      const generatePrompt = this.messageHandler.generatePrompt(prompt, media);
      const sendMsg = await this.messageHandler.sendMessage(
        startChat,
        generatePrompt,
        message,
      );
      const response = this.messageHandler.extractResponse(sendMsg);

      await this.historyManager.saveHistory(user, prompt, response, media);
      this.messageHandler.replyMessage(message, response);
    } catch (error) {
      this.errorHandler.handleError(message, error);
    }
  }
}

module.exports = GeminiAI
