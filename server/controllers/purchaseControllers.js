const { default: firebase } = require("../firebase");
const { default: Purchase } = require("../models/purchaseModel");
const { getDatabase, set, ref, get, push } = require("firebase/database");

const db = getDatabase(firebase);

export const createPurchase = async (req, res, next) => {
  // pass to the server userUid!
  try {
    const { data, userUid } = req.body;
    await set(ref(db, `users/${userUid}/purchases`), data);
    res.status(200).send("purchase created successfully");
  } catch (error) {
    res.status(500).send(error.message);
  }
};
