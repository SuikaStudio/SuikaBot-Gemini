class ResetChat {
  constructor() {
    this.db = require("../db/connection");
    this.geminiHistory = this.db.models.History;
  }

  async main(message) {
    try {
      const user = this._getUser(message);
      const userChat = await this._findUserChat(user);

      if (userChat) {
        await this._deleteUserChat(userChat);
        this._sendReply(message, "Chat history has been reset!");
      } else {
        this._sendReply(message, "You don't have any chat history!");
      }
    } catch (error) {
      console.error("[!] Error: - resetChat", error);
    }
  }

  _getUser(message) {
    return message.author ? message.author : message.from;
  }

  async _findUserChat(user) {
    return await this.geminiHistory.findOne({ where: { user: user } });
  }

  async _deleteUserChat(userChat) {
    await userChat.destroy();
  }

  _sendReply(message, text) {
    message.reply(text);
  }
}

module.exports = ResetChat;
