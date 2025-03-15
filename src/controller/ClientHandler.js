const qrcode = require("qrcode-terminal");

class ClientHandler {
  constructor({ queueManager }) {
    this.queueManager = queueManager;
  }

  onQr = (qr) => {
    try {
      qrcode.generate(qr, { small: true });
    } catch (error) {
      console.error("[!] Error: - qr", error);
    }
  }

  onReady = () => {
    console.log("Client is ready!");
  }

  onAuthFailure = (message) => {
    console.log("Authentication failure", message);
  }

  onMessage = async (message) => {
    try {
      await this.queueManager.enqueue(message);
    } catch (error) {
      console.error("[!] Error: - message", error);
    }
  }

  onMessageRevokeEveryone = async (message, revokedMsg) => {    
    try {
      await this.queueManager.revoke(message, revokedMsg);
    } catch (error) {
      console.error("[!] Error: - msg_revoke_everyone", error);
    }
  }

  onCall = (call) => {
    try {
      call.reject();
    } catch (error) {
      console.error("Reject call failed:", error.message);
    }
  }

  onDisconnect = (reason) => {
    console.log("Client was logged out: ", reason);
  }
}

module.exports = ClientHandler;