import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, cert } from 'firebase-admin/app';
import { createContainer, asClass, asValue } from "awilix";

import ClientHandler from "../controller/ClientHandler.js";
import QueueManager from "../controller/QueueManager.js";
import MessageHandler from "../controller/MessageHandler.js";
import ChatbotRepository from "../repositories/ChatbotRepository.js";
import ChatBotService from "../services/ChatBotService.js";
import ResetChatService from "../services/ResetChatService.js";
import GeminiAI from "../lib/GeminiAI.js";

import serviceAccount from '../../google-service-account.json' with { type: "json" };

initializeApp({
  credential: cert(serviceAccount)
});

const container = createContainer();
container.register({
  firestore: asValue(getFirestore()),
  clientHandler: asClass(ClientHandler).singleton(),
  queueManager: asClass(QueueManager).singleton(),
  messageHandler: asClass(MessageHandler).singleton(),
  chatBotRepository: asClass(ChatbotRepository).singleton(),
  chatBotService: asClass(ChatBotService).singleton(),
  resetChatService: asClass(ResetChatService).singleton(),
  geminiAI: asClass(GeminiAI).singleton(),
});

export default container;
