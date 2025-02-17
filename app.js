const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");
const admin = require("firebase-admin");
require("dotenv").config();
const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_CONFIG);

// Initialize Firebase Admin with service account credentials
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // Optionally, add databaseURL if needed:
  // databaseURL: "https://<your-project-id>.firebaseio.com"
});

// Use admin.firestore() for Firestore access
const db = admin.firestore();

// Import our health calculation functions
const {
  calculateNeuronsKilled,
  calculateLifeLost,
} = require("./scoreCalculations");

// Enable CORS for requests from your frontend (adjust the origin as needed)
app.use(cors({ origin: "http://localhost:5173" }));

// Middleware to parse JSON requests
app.use(express.json());

// Global request logger middleware (optional but helpful for debugging)
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to the Alcohol Tracking App API!");
});

// Token Verification Route (for authenticating users)
app.post("/verify-token", async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).send({ error: "Token is required" });
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log("[verify-token] Token verified for UID:", decodedToken.uid);
    res.status(200).json({ message: "User verified", uid: decodedToken.uid });
  } catch (error) {
    console.error("[verify-token] Token verification failed:", error);
    res.status(401).json({ error: "Invalid token" });
  }
});

// GET /users route - Fetch all users from Firestore
app.get("/users", async (req, res) => {
  try {
    const usersSnapshot = await db.collection("users").get();
    const users = [];
    usersSnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    res.status(200).json(users);
  } catch (error) {
    console.error("[GET /users] Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// POST /log-drink route - Log a new drink and update metrics
app.post("/log-drink", async (req, res) => {
  const { token, drink } = req.body;
  console.log("[/log-drink] Request received with token and drink:", {
    token: !!token,
    drink,
  });

  if (!token) {
    console.error("[/log-drink] No token provided in request body.");
    return res.status(400).json({ error: "Authentication token required" });
  }

  try {
    // Use admin.auth() to verify the token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;
    console.log("[/log-drink] Token verified. UID:", uid);

    // Retrieve the user's document from Firestore using the UID
    const userDocRef = db.collection("users").doc(uid);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      console.error("[/log-drink] User document not found for UID:", uid);
      return res.status(404).json({ error: "User not found" });
    }
    const userData = userDoc.data();
    console.log("[/log-drink] Retrieved user data:", userData);

    // Calculate user's age from their date of birth (assumed stored as dateOfBirth)
    const birthDate = new Date(userData.dateOfBirth);
    const age = Math.floor(
      (new Date() - birthDate) / (365.25 * 24 * 60 * 60 * 1000)
    );
    console.log("[/log-drink] Calculated age:", age);

    // Build an object with the necessary fields for our calculations
    const userForCalc = {
      weight: userData.weight,
      age: age,
      neuronsKilled: userData.neuronsKilled || 0,
      smoker: userData.smoker,
      exercisePerWeek: userData.exercisePerWeek,
    };

    // Calculate new metrics
    const newNeuronsKilled = calculateNeuronsKilled(userForCalc, drink);
    const additionalLifeLost = calculateLifeLost(userForCalc, drink);
    const newLifeLost = (userData.lifeLost || 0) + additionalLifeLost;
    console.log("[/log-drink] Calculated metrics:", {
      newNeuronsKilled,
      additionalLifeLost,
      newLifeLost,
    });

    // Update the user's document with the new drink and updated metrics
    await userDocRef.update({
      drinkHistory: admin.firestore.FieldValue.arrayUnion(drink),
      neuronsKilled: newNeuronsKilled,
      lifeLost: newLifeLost,
    });
    console.log(
      "[/log-drink] User document updated successfully for UID:",
      uid
    );

    const responseBody = { message: "Drink logged successfully" };
    console.log("[/log-drink] Sending response:", responseBody);
    return res.status(200).json(responseBody);
  } catch (error) {
    console.error("[/log-drink] Error logging drink:", error);
    return res
      .status(500)
      .json({ error: "Failed to log drink", details: error.message });
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
