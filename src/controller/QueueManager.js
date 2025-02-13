class QueueManager {
  constructor({ messageHandler }) {
    this.queues = {};
    this.isProcessing = {};
    this.promises = {};
    this.messageHandler = messageHandler;
  }

  async process(sender) {
    try {
      this.isProcessing[sender] = true;
  
      this.promises[sender] = {};
      this.promises[sender].promise = new Promise((resolve, reject) => {
        this.promises[sender] = { resolve, reject };
      });
  
      while (this.queues[sender].length > 0) {
        const message = this.queues[sender].shift();
        await this.messageHandler.main(message);
      }
  
      this.promises[sender].resolve();  
      delete this.queues[sender];
    } catch (error) {
      console.error("[!] Error: - processQueue", error);
    } finally {
      delete this.isProcessing[sender];
    }
  }

  async enqueue(message) {
    const sender = message.from;
  
    if (!this.queues[sender]) {
      this.queues[sender] = [];
      this.isProcessing[sender] = false;
    }
  
    this.queues[sender].push(message);
  
    if (!this.isProcessing[sender]) {
      await this.process(sender);
    }
  }

  async revoke(message, revokedMsg) {
    const sender = message.from;
  
    if (this.queues[sender]) {
      const found = this.queues[sender].some((msg, index) => {
        if (msg.timestamp === revokedMsg.timestamp) {
          this.queues[sender].splice(index, 1);
          return true;
        }
        return false;
      });
  
      if (found && this.isProcessing[sender] && this.promises[sender]) {
        this.promises[sender].reject("Process canceled");
      }
    }
  }
}

module.exports = QueueManager;