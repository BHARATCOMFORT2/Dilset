import { auth, db } from "./firebase-config.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.querySelector("button").addEventListener("click", async () => {

  const name = document.querySelector('input[placeholder="Full Name"]').value;
  const age = document.querySelector('input[placeholder="Age"]').value;
  const city = document.querySelector('input[placeholder="City"]').value;
  const gender = document.querySelectorAll("select")[0].value;
  const intent = document.querySelectorAll("select")[1].value;
  const email = document.querySelector('input[type="email"]').value;
  const password = document.querySelector('input[type="password"]').value;

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);

    await setDoc(doc(db, "users", userCred.user.uid), {
      name,
      age,
      city,
      gender,
      intent,
      createdAt: Date.now()
    });

    alert("Signup success");
    window.location.href = "app.html";

  } catch (e) {
    alert(e.message);
  }

});
