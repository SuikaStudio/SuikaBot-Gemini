const { VertexAI } = require("@google-cloud/vertexai");

const config = require("../config/vertexAI");

class VertexAIService {
  constructor() {
    this.vertexAI = new VertexAI(config);
  }

  getGenerativeModel(config) {
    return this.vertexAI.getGenerativeModel(config);
  }
}

module.exports = VertexAIService;
