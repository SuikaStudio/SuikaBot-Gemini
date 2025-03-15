class ChatbotRepository {
  constructor({ firestore }) {
    this.firestore = firestore;
    this.collection1 = "ChatbotUsers";
    this.collection2 = "GeminiHistory";
  }

  async getChatHistory(user) {
    const history = await this.firestore
      .collection(this.collection1)
      .doc(user)
      .collection(this.collection2)
      .get();
      
    return history.docs.map(doc => doc.data());
  }
  
  async addChatHistory(user, data) {
    await this.firestore
      .collection(this.collection1)
      .doc(user)
      .collection(this.collection2)
      .add(data)
  }

  async deleteChatHistory(user) {
    const history = await this.firestore
      .collection(this.collection1)
      .doc(user)
      .collection(this.collection2)
      .get();
    
    if (!history.size) return null;

    const batch = this.firestore.batch();
    history.docs.forEach(doc => batch.delete(doc.ref));

    await batch.commit();
    return true;
  }
}

module.exports = ChatbotRepository;