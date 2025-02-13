class MessageHandler {
  constructor(generativeModel) {
    this.generativeModel = generativeModel;
    this.intervalId = null;
  }

  generatePrompt(prompt, media) {
    if (media) {
      return [
        { text: prompt },
        {
          inlineData: {
            mimeType: media.mimetype,
            data: media.data,
          },
        },
      ];
    } else {
      return prompt;
    }
  }

  async sendMessage(chat, prompts, message) {
    const startTime = Date.now();
    this.startIntervalWarning(startTime, message);

    const result = await chat.sendMessage(prompts);
    clearInterval(this.intervalId);

    return result;
  }

  startIntervalWarning(startTime, message) {
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

  replyMessage(message, response) {
    message.reply(
      response
        ? response
        : "Maaf saya tidak bisa menjawab pertanyaan tersebut.",
    );
  }
}

module.exports = MessageHandler;
