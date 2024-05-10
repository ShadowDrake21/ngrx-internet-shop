import firebase from "../firebase.js";
import { getDatabase, set, ref, get, push } from "firebase/database";

const db = getDatabase(firebase);

const createPurchase = async (purchaseItem) => {
  const { products, payment_intent, customer_id, session_id } = purchaseItem;
  await set(ref(db, `customers/${customer_id}/purchases/${session_id}`), {
    products,
    payment_intent,
  });
};

export default createPurchase;
