import firebase from "../firebase.js";
import { getDatabase, set, ref, get, push } from "firebase/database";

const db = getDatabase(firebase);

const createPurchase = async (products, id, session_id) => {
  await set(ref(db, `customers/${id}/purchases/${session_id}`), products);
};

export default createPurchase;
