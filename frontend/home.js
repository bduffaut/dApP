import { auth, db } from "./firebaseClient.js";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// Function to fetch and update the user's scores on the front end
async function fetchUserMetrics() {
  if (!auth.currentUser) return;
  try {
    const userDocRef = doc(db, "users", auth.currentUser.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      // Update the scores; round as needed
      document.getElementById("neurons-killed").textContent =
        Math.round(userData.neuronsKilled) || 0;
      document.getElementById("days-taken-off").textContent =
        Math.round(userData.lifeLost) || 0;
      console.log("[fetchUserMetrics] Updated metrics:", {
        neuronsKilled: userData.neuronsKilled,
        lifeLost: userData.lifeLost,
      });
    } else {
      console.warn("[fetchUserMetrics] No user data found.");
    }
  } catch (error) {
    console.error("[fetchUserMetrics] Error fetching user metrics:", error);
  }
}

// Show current user email using modular methods
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("[onAuthStateChanged] User logged in:", user.email);
    document.getElementById("user-email").textContent = user.email;
    // Update scores on login
    fetchUserMetrics();
  } else {
    console.warn(
      "[onAuthStateChanged] No user detected. Redirecting to login."
    );
    window.location.href = "/index.html";
  }
});

// Logout functionality using modular methods
document.getElementById("logout-btn").addEventListener("click", () => {
  console.log("[logout] Initiating logout...");
  signOut(auth)
    .then(() => {
      console.log("[logout] Logout successful.");
      window.location.href = "/index.html";
    })
    .catch((error) => {
      console.error("[logout] Logout error:", error);
    });
});

// Get cocktail data
async function fetchCocktailData(searchTerm) {
  console.log(
    "[fetchCocktailData] Searching for cocktails with term:",
    searchTerm
  );
  const apiKey = import.meta.env.VITE_COCKTAIL_API_KEY;
  const url = `https://www.thecocktaildb.com/api/json/v1/${apiKey}/search.php?s=${searchTerm}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log("[fetchCocktailData] Response received:", data);

    if (data.drinks) {
      displayCocktailIngredients(data.drinks);
    } else {
      document.getElementById("cocktail-results").innerHTML =
        "<p>No Cocktails Found</p>";
    }
  } catch (error) {
    console.error("[fetchCocktailData] Error fetching cocktail data:", error);
  }
}

// Display ingredients of the searched cocktail
function displayCocktailIngredients(cocktails) {
  const resultsContainer = document.getElementById("cocktail-results");
  resultsContainer.innerHTML = ""; // Clear previous results

  cocktails.forEach((cocktail) => {
    const cocktailElement = document.createElement("div");
    cocktailElement.innerHTML = `
      <h3>${cocktail.strDrink}</h3>
      <img src="${cocktail.strDrinkThumb}" alt="${
      cocktail.strDrink
    }" width="150">
      <p><strong>Ingredients:</strong> ${getIngredients(cocktail)}</p>
    `;
    resultsContainer.appendChild(cocktailElement);
  });
}

// Get ingredients of the cocktail
function getIngredients(cocktail) {
  let ingredients = [];
  for (let i = 1; i <= 15; i++) {
    let ingredient = cocktail[`strIngredient${i}`];
    let measure = cocktail[`strMeasure${i}`];
    if (ingredient) {
      ingredients.push(`${measure || ""} ${ingredient}`);
    }
  }
  return ingredients.join(", ");
}

// Search for cocktail
document.getElementById("search-btn").addEventListener("click", () => {
  const searchTerm = document.getElementById("search-input").value;
  console.log("[search] Searching for:", searchTerm);
  fetchCocktailData(searchTerm);
});

// Log a drink: gather form data and send to the backend
document.getElementById("log-drink-btn").addEventListener("click", async () => {
  console.log("[log-drink] Log drink button clicked.");

  // Gather drink details
  const drinkName = document.getElementById("drink-name").value;
  const drinkQuantity = document.getElementById("drink-quantity").value;
  const drinkTime = document.getElementById("drink-time").value;
  const drinkAlcContent = document.getElementById("drink-alc-content").value;
  const drinkSugarContent = document.getElementById(
    "drink-sugar-content"
  ).value;

  if (!drinkName || !drinkQuantity || !drinkTime || !drinkAlcContent) {
    console.warn("[log-drink] Missing fields. Aborting drink log.");
    alert("Please fill in all required fields to log your drink.");
    return;
  }

  // Construct the drink object; default sugarContent to 0 if empty
  const drink = {
    name: drinkName,
    quantity: parseFloat(drinkQuantity),
    time: drinkTime,
    alcoholContent: parseFloat(drinkAlcContent),
    sugarContent: drinkSugarContent ? parseFloat(drinkSugarContent) : 0,
  };
  console.log("[log-drink] Drink details collected:", drink);

  try {
    console.log("[log-drink] Retrieving token...");
    const token = await auth.currentUser.getIdToken(true);
    const uid = auth.currentUser.uid;
    console.log("[log-drink] Token retrieved and user UID:", uid);

    const backendBaseUrl = import.meta.env.VITE_BACKEND_API_BASE_URL;
    const response = await fetch(`${backendBaseUrl}/log-drink`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, drink }),
    });

    const responseText = await response.text();
    console.log("[log-drink] Raw response text:", responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error(
        "[log-drink] Failed to parse JSON:",
        parseError,
        "Response text:",
        responseText
      );
      throw parseError;
    }

    if (response.ok) {
      console.log("[log-drink] Parsed response received:", data);
      alert("Drink logged successfully!");
      // Optionally clear the form fields
      document.getElementById("drink-name").value = "";
      document.getElementById("drink-quantity").value = "";
      document.getElementById("drink-time").value = "";
      document.getElementById("drink-alc-content").value = "";
      document.getElementById("drink-sugar-content").value = "";
      // Refresh user metrics to update scores on the page
      fetchUserMetrics();
    } else {
      console.error("[log-drink] Server error:", data);
      alert("Error: " + data.error);
    }
  } catch (error) {
    console.error("[log-drink] Error logging drink:", error);
    alert("Failed to log drink.");
  }
});
