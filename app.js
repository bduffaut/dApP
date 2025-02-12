const express = require("express");
const app = express();
const port = 3000;
const { db, auth } = require("./firebase");

// Middleware to parse JSON requests
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to the Alcohol Tracking App API!");
});

// Token Verification Route (Used for authenticating users)
// This remains useful if you need to verify tokens sent from the client.
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

// GET /users route
// Fetch all users from Firestore
app.get("/users", async (req, res) => {
  try {
    const usersSnapshot = await db.collection("users").get();
    const users = [];

    usersSnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
