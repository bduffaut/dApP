import { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, setDoc, doc } from "./firebaseClient.js";

// Function to sign up a user
async function signup() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const messageBox = document.getElementById("message");

    if (!email || !password) {
        messageBox.innerText = "❌ Please enter an email and password.";
        return;
    }

    try {
        // Create user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Store user in Firestore Database
        await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            createdAt: new Date()
        });

        messageBox.innerText = `✅ Signed up as ${user.email}`;
        console.log("User signed up and stored in Firestore:", user);
    } catch (error) {
        messageBox.innerText = `❌ Error: ${error.message}`;
        console.error("Signup Error:", error);
    }
}

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
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        messageBox.innerText = `✅ Logged in as ${user.email}`;
        console.log("User logged in:", user);
    } catch (error) {
        messageBox.innerText = `❌ Error: ${error.message}`;
        console.error("Login Error:", error);
    }
}

// Attach functions to buttons in index.html
document.getElementById("signup-btn").addEventListener("click", signup);
document.getElementById("login-btn").addEventListener("click", login);
