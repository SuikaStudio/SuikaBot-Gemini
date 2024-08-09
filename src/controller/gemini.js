class GeminiAI {
  constructor() {
    this.intervalId = null;
    this.vertexAI = null;
    this.generativeModel = null;
    this.db = null;
    this.geminiHistory = null;
  }

  async init() {
    const {
      VertexAI,
      HarmBlockThreshold,
      HarmCategory,
    } = require("@google-cloud/vertexai");

    this.vertexAI = new VertexAI({
      project: process.env.GOOGLE_PROJECT_ID,
      location: "us-west1",
    });
    this.generativeModel = this.vertexAI.getGenerativeModel({
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

    this.db = require("../db/connection");
    this.geminiHistory = this.db.models.History;
  }

  async main(message) {
    try {
      await this.init();

      const user = message.author ? message.author : message.from;
      const prompt = message.body;
      const media = message.hasMedia
        ? await message.downloadMedia()
        : undefined;

      const history = await this.getHistory(user);
      const startChat = this.generativeModel.startChat({ history });

      const generatePrompt = this.generatePrompt(prompt, media);
      const sendMsg = await this.sendMessage(
        startChat,
        generatePrompt,
        message,
      );
      const response = this.extractResponse(sendMsg);

      await this.saveHistory(user, prompt, response, media);

      this.replyMessage(message, response);
    } catch (error) {
      this.handleError(message, error);
    }
  }

  async getHistory(user) {
    const history = [];

    let userHistory = await this.geminiHistory.findAll({ where: { user } });
    if (userHistory) {
      if (userHistory.length >= 170) {
        await this.geminiHistory.destroy({
          where: {},
          limit: 1,
          order: [["id", "ASC"]],
        });
      }

      userHistory = JSON.parse(JSON.stringify(userHistory, null, 2));
      userHistory.forEach((record) => {
        const historyItem = { role: "user", parts: [{ text: record.prompt }] };
        if (record.attachment) {
          historyItem.parts.push({
            inlineData: {
              data: record.attachment,
              mimeType: record.attachment_mime,
            },
          });
        }

        history.push(historyItem);
        history.push({
          role: "model",
          parts: [{ text: record.response }],
        });
      });
      return history;
    }

    return [];
  }

  generatePrompt(prompt, media) {
    if (media) {
      return [
        { text: prompt },
        {
          inlineData: {
            mimeType: media ? media.mimetype : null,
            data: media ? media.data : null,
          },
        },
      ];
    } else {
      return prompt;
    }
  }

  async sendMessage(chat, prompts, message) {
    const startTime = Date.now();
    let hasWarned = false;

    this.intervalId = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime > 30000 && !hasWarned) {
        message.reply(
          "*[Pesan dari Sistem]*\n\n" +
            "Maaf, permintaan kamu membutuhkan waktu yang lebih lama untuk diproses, mohon bersabar yaa 🥺",
        );
        hasWarned = true;
      }
    }, 100);

    const result = await chat.sendMessage(prompts);
    clearInterval(this.intervalId);

    return result;
  }

  extractResponse(result) {
    if (
      !result.response.candidates ||
      result.response?.candidates?.[0]?.finishReason !== "STOP"
    ) {
      throw result;
    }

    return result.response.candidates[0].content.parts[0].text.trimEnd();
  }

  async saveHistory(user, prompt, response, media) {
    await this.geminiHistory.create({
      user,
      prompt,
      response: response
        ? response
        : "Maaf saya tidak bisa menjawab pertanyaan tersebut.",
      attachment: media ? media.data : null,
      attachment_mime: media ? media.mimetype : null,
    });
  }

  replyMessage(message, response) {
    message.reply(
      response
        ? response
        : "Maaf saya tidak bisa menjawab pertanyaan tersebut.",
    );
  }

  handleError(message, error) {
    console.log(error);
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    let errorJSON = error?.message?.match(/({.*})/)?.[0];
    errorJSON = errorJSON ? JSON.parse(errorJSON) : undefined;

    if (
      error.response?.candidates?.[0]?.finishReason === "SAFETY" ||
      error.response?.promptFeedback?.blockReason === "SAFETY"
    ) {
      message.reply(
        "Kamu jangan aneh-aneh ih 🤗\n\n" +
          "*[Google Gemini]* (Block Reason : SAFETY)",
      );
      return;
    }

    if (
      error.response?.candidates?.[0]?.finishReason === "OTHER" ||
      error.response?.promptFeedback?.blockReason === "OTHER"
    ) {
      message.reply(
        "Kamu jangan aneh-aneh ih 🤗\n\n" +
          "*[Google Gemini]* (Block Reason : OTHER)",
      );
      return;
    }

    if (error.response?.candidates?.[0]?.finishReason === "RECITATION") {
      message.reply(
        "Duh Gemini AI mengalami kesalahan berpikir 😔\n" +
          "Coba tanya ulang dengan kalimat lain 👉👈\n\n*" +
          "*[Google Gemini]* (Block Reason : RECITATION)",
      );
      return;
    }

    if (errorJSON && errorJSON?.error?.code === 500) {
      console.log("[!] Gemini 1.5: Error", error.code);
      message.reply(
        "Gagal memproses pesan, coba lagi nanti...\n\n" +
          "*[Google Gemini]* (500) Internal Server Error",
      );
      return;
    }

    if (errorJSON && errorJSON?.error?.code === 503) {
      console.log("[!] Gemini 1.5: Error", error.code);
      message.reply(
        "Ups, gagal memproses pesan, mohon coba lagi nanti. 😥\n\n" +
          "*[Google Gemini]* (503) Service Unavailable / Overload",
      );
      return;
    }

    if (errorJSON && errorJSON?.error?.code === 400) {
      console.log("[!] Gemini 1.5: Error", error.code);
      message.reply(
        "Coba cek lagi prompt / file yang dikirim, mungkin tidak valid 🙄\n\n" +
          "*[Google Gemini]* (400) Invalid Argument",
      );
      return;
    }

    console.log(error);
    message.reply("Gagal memproses pesan, coba lagi nanti...");
  }
}

module.exports = GeminiAI;
