import { db, auth } from "./firebase-config.js";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  getDocs,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const statusEl = document.getElementById("status");
const chatBox = document.getElementById("chatBox");
const msgInput = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");
const nextBtn = document.getElementById("nextBtn");
const stopBtn = document.getElementById("stopBtn");
const typingEl = document.getElementById("typing");
const genderPrefEl = document.getElementById("genderPref");
const reportBtn = document.getElementById("reportBtn");

let myQueueId=null;
let chatId=null;
let unsubMessages=null;
let timeoutTimer=null;
let partnerUid=null;

async function joinQueue(){
  statusEl.innerText="Connecting...";

  const genderPref = genderPrefEl.value;

  const qRef = await addDoc(collection(db,"strangerQueue"),{
    uid: auth.currentUser.uid,
    genderPref,
    createdAt: serverTimestamp()
  });

  myQueueId=qRef.id;
  findMatch();
}

async function findMatch(){
  const snap = await getDocs(collection(db,"strangerQueue"));

  const users=[];
  snap.forEach(d=>users.push({id:d.id,...d.data()}));

  const me = users.find(u=>u.uid===auth.currentUser.uid);

  const other = users.find(u=>{
    if(u.uid===auth.currentUser.uid) return false;

    // gender match
    if(me.genderPref==="any") return true;
    return u.genderPref==="any" || u.genderPref===me.genderPref;
  });

  if(me && other){
    await deleteDoc(doc(db,"strangerQueue",me.id));
    await deleteDoc(doc(db,"strangerQueue",other.id));

    const chatRef = await addDoc(collection(db,"strangerChats"),{
      users:[me.uid,other.uid],
      createdAt:serverTimestamp(),
      typing:null
    });

    chatId=chatRef.id;
    partnerUid=other.uid;
    startChat();
  }else{
    setTimeout(findMatch,2000);
  }
}

function startChat(){
  statusEl.innerText="Connected";
  chatBox.innerHTML="";

  const chatRef = doc(db,"strangerChats",chatId);

  const msgsRef = collection(db,"strangerChats",chatId,"messages");

  unsubMessages = onSnapshot(query(msgsRef,orderBy("time")),snap=>{
    chatBox.innerHTML="";
    snap.forEach(d=>{
      const m=d.data();
      const div=document.createElement("div");
      div.className="msg "+(m.uid===auth.currentUser.uid?"me":"stranger");
      div.innerText=m.text;
      chatBox.appendChild(div);
    });
    chatBox.scrollTop=chatBox.scrollHeight;
  });

  // typing listener
  onSnapshot(chatRef,snap=>{
    const data=snap.data();
    if(data.typing && data.typing!==auth.currentUser.uid){
      typingEl.innerText="Stranger is typing...";
    }else{
      typingEl.innerText="";
    }
  });

  resetTimeout();
}

function resetTimeout(){
  clearTimeout(timeoutTimer);
  timeoutTimer=setTimeout(()=>{
    statusEl.innerText="Disconnected (timeout)";
    chatId=null;
    chatBox.innerHTML="";
  },60000);
}

async function sendMsg(){
  const text=msgInput.value.trim();
  if(!text||!chatId) return;

  await addDoc(collection(db,"strangerChats",chatId,"messages"),{
    uid:auth.currentUser.uid,
    text,
    time:serverTimestamp()
  });

  await updateDoc(doc(db,"strangerChats",chatId),{
    typing:null
  });

  msgInput.value="";
  resetTimeout();
}

msgInput.addEventListener("input", async ()=>{
  if(!chatId) return;

  await updateDoc(doc(db,"strangerChats",chatId),{
    typing:auth.currentUser.uid
  });
});

sendBtn.onclick=sendMsg;

nextBtn.onclick=async ()=>{
  if(unsubMessages) unsubMessages();
  chatId=null;
  joinQueue();
};

stopBtn.onclick=()=>{
  if(unsubMessages) unsubMessages();
  chatId=null;
  statusEl.innerText="Stopped";
  chatBox.innerHTML="";
};

reportBtn.onclick=async ()=>{
  if(!chatId || !partnerUid) return;

  await addDoc(collection(db,"strangerReports"),{
    reporter:auth.currentUser.uid,
    reported:partnerUid,
    chatId,
    time:serverTimestamp()
  });

  alert("Reported");
};

joinQueue();
