class VertexAIHandler {
  constructor() {
    const {
      VertexAI,
      HarmBlockThreshold,
      HarmCategory,
    } = require("@google-cloud/vertexai");

    this.vertexAI = new VertexAI({
      project: process.env.GOOGLE_PROJECT_ID,
      location: "us-west1",
    });

    this.generativeModel = this.createGenerativeModel({
      HarmBlockThreshold,
      HarmCategory,
    });
  }

  createGenerativeModel({ HarmBlockThreshold, HarmCategory }) {
    return this.vertexAI.getGenerativeModel({
      model: "gemini-1.5-flash-preview-0514",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
      systemInstruction: {
        parts: [
          {
            text: `Gunakan bahasa indonesia sebagai bahasa default untuk model menjelaskan.`,
          },
        ],
      },
    });
  }
}

module.exports = VertexAIHandler;
