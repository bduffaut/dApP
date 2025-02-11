const express = require('express');
const app = express();
const port = 3000;
const { db } = require('./firebase'); // Import the db object

app.use(express.json());

app.get('/', (req, res) => {
  // ...
});

app.post('/users', async (req, res) => {
  const newUser = req.body; // Get user data from the request body

  try {
    await db.collection('users').add(newUser); // Add the user to Firestore
    res.status(201).send('User created successfully!');
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).send('Error creating user');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
