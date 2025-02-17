import { auth } from "./firebaseClient.js";

// Show current user email
auth.onAuthStateChanged((user) => {
  if (user) {
    document.getElementById("user-email").textContent = user.email;
  } else {
    window.location.href = "/index.html";
  }
});

// Logout functionality
document.getElementById("logout-btn").addEventListener("click", () => {
  auth
    .signOut()
    .then(() => {
      window.location.href = "/index.html";
    })
    .catch((error) => {
      console.error("Logout error:", error);
    });
});
//Get cocktail data
async function fetchCocktailData(searchTerm) {
  const apiKey = import.meta.env.VITE_COCKTAIL_API_KEY;
  const url = `https://www.thecocktaildb.com/api/json/v1/${apiKey}/search.php?s=${searchTerm}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.drinks) {
      displayCocktailIngredients(data.drinks);
    } else {
      document.getElementById("cocktail-results").innterHTML =
        "<p>No Cocktails Found</p>";
    }
  } catch (error) {
    console.error("Error fetching cocktail data:", error);
  }
}

//Display ingredients of the searched cocktail
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

//Get ingredients of the cocktail
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
//Search for cocktail
document.getElementById("search-btn").addEventListener("click", () => {
  const searchTerm = document.getElementById("search-input").value;
  fetchCocktailData(searchTerm);
});

// log a drink

document
  .getElementById("log-drink-btn")
  .addEventListener("click", async () => {});
