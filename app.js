// Import required modules
const express = require("express");
const app = express();
const port = 3000;
const { db, auth } = require("./firebase"); // ✅ Ensure auth is imported

// Middleware to parse JSON requests
app.use(express.json());

// ✅ Root route - Just a basic welcome message
app.get("/", (req, res) => {
  res.send("Welcome to the Alcohol Tracking App API!");
});

// ✅ User Signup Route
app.post("/signup", async (req, res) => {
  const { email, password, username } = req.body; // Extract user details from request body

  if (!email || !password || !username) {
    return res
      .status(400)
      .send({ error: "Email, password, and username are required" });
  }

  try {
    // Create a new user in Firebase Authentication
    const userRecord = await auth.createUser({
      email,
      password,
    });

    // Store user details in Firestore under "users" collection using UID
    await db.collection("users").doc(userRecord.uid).set({
      email,
      username,
      createdAt: new Date(),
    });

    res.status(201).send({
      message: "User created successfully!",
      userId: userRecord.uid,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).send({ error: "Failed to create user" });
  }
});

// ✅ User Login Route (Client SDK should handle login)
app.post("/login", async (req, res) => {
  res.status(400).send({
    error:
      "Use Firebase Client SDK for login and send token to backend for verification.",
  });
});

// ✅ Token Verification Route (Used for authenticating users)
app.post("/verify-token", async (req, res) => {
  const { token } = req.body; // Expect an authentication token from frontend

  if (!token) {
    return res.status(400).send({ error: "Token is required" });
  }

  try {
    // Verify Firebase authentication token
    const decodedToken = await auth.verifyIdToken(token);

    res.status(200).send({
      message: "User verified",
      userId: decodedToken.uid,
    });
  } catch (error) {
    res.status(401).send({ error: "Invalid token" });
  }
});

// ✅ Manually Add User to Firestore (Alternative to `/signup`)
app.post("/users", async (req, res) => {
  const { userId, email, username } = req.body; // Extract user details

  if (!userId || !email || !username) {
    return res
      .status(400)
      .send({ error: "userId, email, and username are required" });
  }

  try {
    // Save user details manually in Firestore
    await db.collection("users").doc(userId).set({ email, username });

    res.status(201).send({ message: "User added to Firestore successfully!" });
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).send({ error: "Error adding user" });
  }
});

app.get("/users", async (req, res) => {
  try {
    const usersSnapshot = await db.collection("users").get();
    let users = [];

    usersSnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(users); // ✅ Ensure correct JSON response
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// ✅ Start the Express server
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
