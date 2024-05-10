const { default: firebase } = require("../firebase");
const { default: Purchase } = require("../models/purchaseModel");
const { getDatabase, set, ref, get, push } = require("firebase/database");

const db = getDatabase(firebase);

const createPurchase = async (products, email, session_id) => {
  await set(ref(db, `users/${email}/purchases/${session_id}`), data);
};

export default createPurchase;
