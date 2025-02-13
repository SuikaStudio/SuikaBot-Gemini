class ErrorHandler {
  handleError(message, error) {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    const errorJSON = this.parseErrorToJSON(error);
    this.handleErrorResponse(message, error, errorJSON);
  }

  parseErrorToJSON(error) {
    let errorJSON = error?.message?.match(/({.*})/)?.[0];
    return errorJSON ? JSON.parse(errorJSON) : undefined;
  }

  handleErrorResponse(message, error, errorJSON) {
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

    if (errorJSON?.error?.code === 500) {
      console.log("[!] Gemini 1.5: Error", error.code);
      message.reply(
        "Gagal memproses pesan, coba lagi nanti...\n\n" +
          "*[Google Gemini]* (500) Internal Server Error",
      );
      return;
    }

    if (errorJSON?.error?.code === 503) {
      console.log("[!] Gemini 1.5: Error", error.code);
      message.reply(
        "Ups, gagal memproses pesan, mohon coba lagi nanti. 😥\n\n" +
          "*[Google Gemini]* (503) Service Unavailable / Overload",
      );
      return;
    }

    if (errorJSON?.error?.code === 400) {
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

module.exports = ErrorHandler;
