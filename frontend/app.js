import { auth, signInWithEmailAndPassword } from "./firebaseClient.js";

// Function to log in a user
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const messageBox = document.getElementById("message");

  if (!email || !password) {
    messageBox.innerText = "❌ Please enter an email and password.";
    return;
  }

  try {
    // Log in user
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    messageBox.innerText = `✅ Logged in as ${user.email}`;
    console.log("User logged in:", user);
    window.location.href = "/home.html";
  } catch (error) {
    messageBox.innerText = `❌ Error: ${error.message}`;
    console.error("Login Error:", error);
  }
}

// Attach the login function to the login button
document.getElementById("login-btn").addEventListener("click", login);
