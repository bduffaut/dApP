import {
  auth,
  db,
  createUserWithEmailAndPassword,
  setDoc,
  doc,
} from "./firebaseClient.js";

async function signupUser(event) {
  event.preventDefault(); // Prevent the default form submission
  const messageBox = document.getElementById("message");

  // Get values from the form
  const firstName = document.getElementById("first-name").value.trim();
  const lastName = document.getElementById("last-name").value.trim();
  const dob = document.getElementById("dob").value;
  const height = document.getElementById("height").value;
  const weight = document.getElementById("weight").value;
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  // Basic validation check
  if (
    !firstName ||
    !lastName ||
    !dob ||
    !height ||
    !weight ||
    !email ||
    !password
  ) {
    messageBox.innerText = "❌ Please fill in all fields.";
    return;
  }

  try {
    // Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Build a user object with the additional information
    const userData = {
      email: user.email,
      firstName,
      lastName,
      dateOfBirth: dob,
      height: Number(height),
      weight: Number(weight),
      createdAt: new Date(),
    };

    // Store the user data in Firestore under a document with the user's UID
    await setDoc(doc(db, "users", user.uid), userData);

    messageBox.innerText = `✅ Signed up as ${user.email}`;
    console.log("User signed up and stored in Firestore:", userData);

    // Redirect to the homepage
    window.location.href = "/home.html";
  } catch (error) {
    messageBox.innerText = `❌ Error: ${error.message}`;
    console.error("Signup Error:", error);
  }
}

// Listen for the form submission event
document.getElementById("signup-form").addEventListener("submit", signupUser);
