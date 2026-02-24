import { db, auth } from "../firebase-config.js";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

export let myQueueId = null;

export async function joinQueue(genderPref) {
  const ref = await addDoc(collection(db, "strangerQueue"), {
    uid: auth.currentUser.uid,
    genderPref,
    createdAt: serverTimestamp()
  });

  myQueueId = ref.id;
}

export async function leaveQueue() {
  if (!myQueueId) return;
  await deleteDoc(doc(db, "strangerQueue", myQueueId));
  myQueueId = null;
}
