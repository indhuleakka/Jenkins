let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

// Enter key support
document.getElementById("search").addEventListener("keypress", function(e) {
  if (e.key === "Enter") searchRecipe();
});

function saveFavorites() {
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

function toggleFavorite(meal) {
  let index = favorites.findIndex(f => f.idMeal === meal.idMeal);

  if (index === -1) {
    favorites.push(meal);
  } else {
    favorites.splice(index, 1);
  }

  saveFavorites();
  renderFavorites();
  searchRecipe();
}

function renderFavorites() {
  let box = document.getElementById("favorites");
  box.innerHTML = "";

  if (favorites.length === 0) {
    box.innerHTML = "<p>No favorites yet</p>";
    return;
  }

  favorites.forEach(meal => {
    box.innerHTML += `
      <div class="card">
        <img src="${meal.strMealThumb}">
        <h3>${meal.strMeal}</h3>
        <button onclick="showDetails(${meal.idMeal})">View</button>
      </div>
    `;
  });
}

async function searchRecipe() {
  let query = document.getElementById("search").value;

  if (!query) return alert("Enter recipe name!");

  let container = document.getElementById("recipes");
  container.innerHTML = "<p>Loading...</p>";
  document.getElementById("details").innerHTML = "";

  let res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
  let data = await res.json();

  container.innerHTML = "";

  if (!data.meals) {
    container.innerHTML = `
      <p>No recipes found 😕</p>
      <p>Try: chicken, pasta, cake</p>
    `;
    return;
  }

  data.meals.forEach(meal => {
    let isFav = favorites.some(f => f.idMeal === meal.idMeal);
    let savedRating = localStorage.getItem("rating_" + meal.idMeal) || 0;

    let stars = "";
    for (let i = 1; i <= 5; i++) {
      stars += `<span onclick="rate(${meal.idMeal},${i})">
        ${i <= savedRating ? "⭐" : "☆"}
      </span>`;
    }

    container.innerHTML += `
      <div class="card">
        <img src="${meal.strMealThumb}">
        <h3>${meal.strMeal}</h3>

        <button onclick="showDetails(${meal.idMeal})">View</button>
        <button onclick='toggleFavorite(${JSON.stringify(meal)})'>
          ${isFav ? "❤️" : "🤍"}
        </button>

        <div class="rating">${stars}</div>
      </div>
    `;
  });
}

// Rating toggle
function rate(id, value) {
  let current = localStorage.getItem("rating_" + id);

  if (current == value) {
    localStorage.removeItem("rating_" + id);
  } else {
    localStorage.setItem("rating_" + id, value);
  }

  searchRecipe();
}

async function showDetails(id) {
  let res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
  let data = await res.json();
  let meal = data.meals[0];

  let ingredients = "";

  for (let i = 1; i <= 20; i++) {
    if (meal["strIngredient" + i]) {
      ingredients += `<li>${meal["strIngredient"+i]} - ${meal["strMeasure"+i]}</li>`;
    }
  }

  document.getElementById("details").innerHTML = `
    <div class="details">
      <h2>${meal.strMeal}</h2>
      <img src="${meal.strMealThumb}">

      <h3>Ingredients:</h3>
      <ul>${ingredients}</ul>

      <h3>Instructions:</h3>
      <p>${meal.strInstructions}</p>
    </div>
  `;

  document.getElementById("details").scrollIntoView({behavior: "smooth"});
}

// initial load
renderFavorites();

