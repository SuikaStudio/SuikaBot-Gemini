const { createContainer, asClass, asValue } = require("awilix");
const { getFirestore } = require("firebase-admin/firestore");

const ClientHandler = require("../controller/ClientHandler");
const QueueManager = require("../controller/QueueManager");
const MessageHandler = require("../controller/MessageHandler");
const ChatbotRepository = require("../repositories/ChatbotRepository");
const ChatBotService = require("../services/ChatBotService");
const ResetChatService = require("../services/ResetChatService");
const VertexAI = require("../lib/VertexAI");
const GeminiAI = require("../lib/GeminiAI");

const container = createContainer();

container.register({
  firestore: asValue(getFirestore()),
  clientHandler: asClass(ClientHandler).singleton(),
  queueManager: asClass(QueueManager).singleton(),
  messageHandler: asClass(MessageHandler).singleton(),
  chatBotRepository: asClass(ChatbotRepository).singleton(),
  chatBotService: asClass(ChatBotService).singleton(),
  resetChatService: asClass(ResetChatService).singleton(),
  vertexAI: asClass(VertexAI).singleton(),
  geminiAI: asClass(GeminiAI).singleton(),
});

module.exports = container;
