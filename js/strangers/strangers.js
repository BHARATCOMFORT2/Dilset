import { db, auth } from "../firebase-config.js";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  orderBy,
  query
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { joinQueue, leaveQueue } from "./queue.js";
import { findMatch, chatId, partnerUid } from "./match.js";
import { sendTyping, clearTyping, listenTyping } from "./typing.js";
import { startTimeout, resetTimeout, stopTimeout } from "./timeout.js";
import { reportStranger } from "./report.js";

// UI
const statusEl = document.getElementById("status");
const chatBox = document.getElementById("chatBox");
const msgInput = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");
const nextBtn = document.getElementById("nextBtn");
const stopBtn = document.getElementById("stopBtn");
const typingEl = document.getElementById("typing");
const genderPrefEl = document.getElementById("genderPref");
const reportBtn = document.getElementById("reportBtn");

let unsubMessages = null;
let unsubTyping = null;

/* ======================
   MATCH FLOW
====================== */

async function connectStranger() {
  statusEl.innerText = "Connecting...";

  await joinQueue(genderPrefEl.value);

  const tryMatch = async () => {
    const id = await findMatch();
    if (id) {
      startChat(id);
    } else {
      setTimeout(tryMatch, 2000);
    }
  };

  tryMatch();
}

/* ======================
   CHAT START
====================== */

function startChat(id) {
  statusEl.innerText = "Connected";
  chatBox.innerHTML = "";

  const msgsRef = collection(db, "strangerChats", id, "messages");

  unsubMessages = onSnapshot(query(msgsRef, orderBy("time")), snap => {
    chatBox.innerHTML = "";

    snap.forEach(d => {
      const m = d.data();
      const div = document.createElement("div");

      div.className = "msg " + (m.uid === auth.currentUser.uid ? "me" : "stranger");
      div.innerText = m.text;

      chatBox.appendChild(div);
    });

    chatBox.scrollTop = chatBox.scrollHeight;
  });

  // typing listener
  unsubTyping = listenTyping(id, typingEl);

  resetTimeout(onTimeout);
}

/* ======================
   TIMEOUT
====================== */

function onTimeout() {
  statusEl.innerText = "Disconnected (timeout)";
  chatBox.innerHTML = "";
  stopChat();
}

/* ======================
   SEND MESSAGE
====================== */

async function sendMsg() {
  if (!chatId) return;

  const text = msgInput.value.trim();
  if (!text) return;

  await addDoc(collection(db, "strangerChats", chatId, "messages"), {
    uid: auth.currentUser.uid,
    text,
    time: serverTimestamp()
  });

  clearTyping(chatId);

  msgInput.value = "";
  resetTimeout(onTimeout);
}

/* ======================
   STOP / NEXT
====================== */

function stopChat() {
  if (unsubMessages) unsubMessages();
  if (unsubTyping) unsubTyping();

  stopTimeout();
}

nextBtn.onclick = () => {
  stopChat();
  connectStranger();
};

stopBtn.onclick = () => {
  stopChat();
  statusEl.innerText = "Stopped";
  chatBox.innerHTML = "";
};

/* ======================
   TYPING
====================== */

msgInput.addEventListener("input", () => {
  if (!chatId) return;
  sendTyping(chatId);
});

/* ======================
   REPORT
====================== */

reportBtn.onclick = () => {
  reportStranger(chatId, partnerUid);
};

/* ======================
   EVENTS
====================== */

sendBtn.onclick = sendMsg;

/* ======================
   INIT
====================== */

connectStranger();
