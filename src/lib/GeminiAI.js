const config = require("../config/gemini");

class GeminiAI {
  constructor({ vertexAI }) {
    this.vertexAI = vertexAI;
  }

  #getVertexModel() {
    return this.vertexAI.getGenerativeModel(config);
  }

  async chat(prompt, history) {
    try {
      const model = this.#getVertexModel();

      const chatSession = model.startChat({ history });
      const chatResponse = await chatSession.sendMessage(prompt);

      return chatResponse.response.candidates[0].content.parts[0].text.trimEnd();
    } catch (error) {
      throw new Error(`GeminiAI Error: ${error.message}`);
    }
  }
}

module.exports = GeminiAI;
