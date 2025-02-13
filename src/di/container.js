const { createContainer, asClass } = require("awilix");

const ClientHandler = require("../controller/ClientHandler");
const QueueManager = require("../controller/QueueManager");
const MessageHandler = require("../controller/MessageHandler");
const Gemini = require("../services/Gemini/GeminiAI");
const ResetChat = require("../services/ResetChat/ResetChat");

const container = createContainer();

container.register({
  messageHandler: asClass(MessageHandler).singleton(),
  queueManager: asClass(QueueManager).singleton(),
  clientHandler: asClass(ClientHandler).singleton(),
  gemini: asClass(Gemini).singleton(),
  resetChat: asClass(ResetChat).singleton(),
});

module.exports = container;
