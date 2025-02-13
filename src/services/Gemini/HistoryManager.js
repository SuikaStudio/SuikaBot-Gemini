class HistoryManager {
  constructor(db) {
    this.geminiHistory = db.models.History;
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
        const historyItem = this.createHistoryItem(record);
        history.push(historyItem);
        history.push({
          role: "model",
          parts: [{ text: record.response }],
        });
      });
    }

    return history;
  }

  createHistoryItem(record) {
    const historyItem = { role: "user", parts: [{ text: record.prompt }] };
    if (record.attachment) {
      historyItem.parts.push({
        inlineData: {
          data: record.attachment,
          mimeType: record.attachment_mime,
        },
      });
    }
    return historyItem;
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
}

module.exports = HistoryManager;
