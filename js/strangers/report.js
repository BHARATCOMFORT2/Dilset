import { db, auth } from "../firebase-config.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

export async function reportStranger(chatId, partnerUid) {
  if (!chatId || !partnerUid) return;

  await addDoc(collection(db, "strangerReports"), {
    reporter: auth.currentUser.uid,
    reported: partnerUid,
    chatId,
    time: serverTimestamp()
  });

  alert("Stranger reported");
}
