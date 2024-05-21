import firebase from "../firebase.js";
import { getDatabase, set, ref, get, push } from "firebase/database";

const db = getDatabase(firebase);

const createPurchase = async (purchaseItem) => {
  const { productsIds, payment_intent, customer_id, session_id, total_price } =
    purchaseItem;
  await set(ref(db, `customers/${customer_id}/purchases/${session_id}`), {
    productsIds,
    payment_intent,
    total_price,
  });
};

export default createPurchase;
