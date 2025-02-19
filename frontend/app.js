import { auth, signInWithEmailAndPassword, db } from "./firebaseClient.js";
import { getDocs, collection } from "firebase/firestore";

// ----------------------
// Login functionality
// ----------------------
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

document.getElementById("login-btn")?.addEventListener("click", login);

// ----------------------
// Leaderboard functionality
// ----------------------
async function fetchLeaderboardData() {
  try {
    // Reference to leaderboard table bodies in the HTML
    const neuronsBody = document.getElementById("leaderboard-neurons-body");
    const lifeBody = document.getElementById("leaderboard-life-body");

    // Fetch all users from the "users" collection
    const usersSnapshot = await getDocs(collection(db, "users"));
    let users = [];
    usersSnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });

    // Sort users by neuronsKilled and lifeLost in descending order
    const sortedNeurons = [...users].sort(
      (a, b) => (b.neuronsKilled || 0) - (a.neuronsKilled || 0)
    );
    const sortedLife = [...users].sort(
      (a, b) => (b.lifeLost || 0) - (a.lifeLost || 0)
    );

    // Clear any existing leaderboard rows
    neuronsBody.innerHTML = "";
    lifeBody.innerHTML = "";

    // Populate the Neurons Killed Leaderboard
    sortedNeurons.forEach((user, index) => {
      const row = document.createElement("tr");

      const rankCell = document.createElement("td");
      rankCell.textContent = (index + 1).toString();

      const nameCell = document.createElement("td");
      nameCell.textContent = user.firstName || user.email || "Anonymous";

      const scoreCell = document.createElement("td");
      scoreCell.textContent = (user.neuronsKilled || 0).toString();

      row.appendChild(rankCell);
      row.appendChild(nameCell);
      row.appendChild(scoreCell);

      neuronsBody.appendChild(row);
    });

    // Populate the Days Taken Off Leaderboard
    sortedLife.forEach((user, index) => {
      const row = document.createElement("tr");

      const rankCell = document.createElement("td");
      rankCell.textContent = (index + 1).toString();

      const nameCell = document.createElement("td");
      nameCell.textContent = user.firstName || user.email || "Anonymous";

      const scoreCell = document.createElement("td");
      scoreCell.textContent = (user.lifeLost || 0).toString();

      row.appendChild(rankCell);
      row.appendChild(nameCell);
      row.appendChild(scoreCell);

      lifeBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
  }
}

// Run leaderboard fetching when the home page DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  if (
    document.getElementById("leaderboard-neurons-body") &&
    document.getElementById("leaderboard-life-body")
  ) {
    fetchLeaderboardData();
  }
});
