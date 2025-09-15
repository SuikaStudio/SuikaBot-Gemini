const { GoogleGenAI } = require("@google/genai");

const config = require("../config/gemini");

class GeminiAI {
  constructor() {
    this.googleGenAI = new GoogleGenAI({
      apiKey: process.env.GOOGLE_API_KEY,
    });
  }

  async chat(prompt, history) {
    try {
      const model = this.googleGenAI.chats;

      const chatSession = model.create({
        config,
        history,
        model: "gemini-2.0-flash",
      });
      const chatResponse = await chatSession.sendMessage({ message: prompt });
      
      return chatResponse.candidates[0].content.parts[0].text.trimEnd();
    } catch (error) {
      throw new Error(`GeminiAI Error: ${error.message}`);
    }
  }
}

module.exports = GeminiAI;
