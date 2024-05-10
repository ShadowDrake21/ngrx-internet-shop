class Purchase {
  constructor(id, price, currency, description, quantity, sessionId) {
    (this.id = id), (this.price = price);
    (this.currency = currency),
      (this.description = description),
      (this.quantity = quantity),
      (this.sessionId = sessionId);
  }
}

export default Purchase;
