import { db, auth } from "../firebase-config.js";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

export let chatId = null;
export let partnerUid = null;

export async function findMatch() {
  const snap = await getDocs(collection(db, "strangerQueue"));

  const users = [];
  snap.forEach(d => users.push({ id: d.id, ...d.data() }));

  const me = users.find(u => u.uid === auth.currentUser.uid);
  if (!me) return null;

  const other = users.find(u => {
    if (u.uid === auth.currentUser.uid) return false;

    if (me.genderPref === "any") return true;
    return u.genderPref === "any" || u.genderPref === me.genderPref;
  });

  if (!other) return null;

  await deleteDoc(doc(db, "strangerQueue", me.id));
  await deleteDoc(doc(db, "strangerQueue", other.id));

  const chatRef = await addDoc(collection(db, "strangerChats"), {
    users: [me.uid, other.uid],
    createdAt: serverTimestamp(),
    typing: null
  });

  chatId = chatRef.id;
  partnerUid = other.uid;

  return chatId;
}
