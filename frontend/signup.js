import {
  auth,
  db,
  createUserWithEmailAndPassword,
  doc,
  setDoc,
} from "./firebaseClient.js";

const signupForm = document.getElementById("signup-form");
const messageBox = document.getElementById("message");

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Collect form values
  const firstName = document.getElementById("first-name").value;
  const lastName = document.getElementById("last-name").value;
  const username = document.getElementById("username").value;
  const dob = document.getElementById("dob").value;
  const height = parseFloat(document.getElementById("height").value);
  const weight = parseFloat(document.getElementById("weight").value);
  const smoker = document.getElementById("smoker").checked;
  const exercise = parseInt(document.getElementById("exercise").value);
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (
    !firstName ||
    !lastName ||
    !username ||
    !dob ||
    !height ||
    !weight ||
    !email ||
    !password
  ) {
    messageBox.innerText = "Please fill in all required fields.";
    return;
  }

  try {
    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Save additional user data to Firestore (using the UID as document ID)
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      firstName,
      lastName,
      username,
      dateOfBirth: dob,
      height,
      weight,
      smoker,
      exercisePerWeek: exercise,
      email,
      drinkHistory: [],
      neuronsKilled: 0,
      lifeLost: 0,
    });

    // (Optional) Store the UID in local storage
    localStorage.setItem("uid", user.uid);

    messageBox.innerText = "Account created successfully!";
    // Redirect to home page
    window.location.href = "/home.html";
  } catch (error) {
    messageBox.innerText = "Error: " + error.message;
    console.error("Signup error:", error);
  }
});
