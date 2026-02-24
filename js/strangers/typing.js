import { db, auth } from "../firebase-config.js";
import { doc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

export function sendTyping(chatId) {
  if (!chatId) return;

  updateDoc(doc(db, "strangerChats", chatId), {
    typing: auth.currentUser.uid
  });
}

export function clearTyping(chatId) {
  if (!chatId) return;

  updateDoc(doc(db, "strangerChats", chatId), {
    typing: null
  });
}

export function listenTyping(chatId, typingEl) {
  return onSnapshot(doc(db, "strangerChats", chatId), snap => {
    const data = snap.data();
    if (!data) return;

    if (data.typing && data.typing !== auth.currentUser.uid) {
      typingEl.innerText = "Stranger is typing...";
    } else {
      typingEl.innerText = "";
    }
  });
}
