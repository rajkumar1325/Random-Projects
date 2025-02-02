//API USED :: MealBD

/*
2 API endpoints
        searching by ingredient
        fetching full recipe
*/


const resultsContainer = document.getElementById('resultsContainer');   //Finds the div where search results will be displayed.
const searchInput = document.getElementById('searchInput');   //Finds the input field where the user enters ingredients.

// It handles the key-press, i.e, using the "Enter" key
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchRecipes();
    }
});


async function searchRecipes() {
    const ingredient = searchInput.value.trim();    //take input and remove any extra spaces.
    if (!ingredient) return;    //if input == empty --> return 


    // Show loading state   --> Displays a "Searching..." message while fetching data.
    resultsContainer.innerHTML = 'Searching for your specified recipie...'; 

    try {
        // MealDB API
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`);

    //Converts the API response from JSON format into JavaScript.
        const data = await response.json(); //await ensures JavaScript waits for the data before proceeding.        

        if (!data.meals) {
            resultsContainer.innerHTML = '<div style="text-align: center; grid-column: 1/-1;">No recipes found for this ingredient. Try another ingredient!</div>';
            return;
        }
        displayRecipes(data.meals);     //Calls displayRecipes() to show the list of recipes.        

    } catch (error) {
        resultsContainer.innerHTML = '<div style="text-align: center; grid-column: 1/-1;">Error... Please try again later.</div>';
    }
}


//DISPLAY MEALS
function displayRecipes(meals) {
    resultsContainer.innerHTML = '';    //Clears previous search results.    

    // Loops through each recipe in the API response.
    meals.forEach(meal => {
        const foodItem = document.createElement('div');
        foodItem.className = 'food-item';

        // Sets the image and title inside the foodItem div.
        foodItem.innerHTML = `
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="food-image">
            <h3 class="food-title">${meal.strMeal}</h3>
        `;

        // Add hover effects
        foodItem.addEventListener('mousemove', (e) => {
            const rect = foodItem.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const angleX = (y - centerY) / 30;
            const angleY = (centerX - x) / 30;

            foodItem.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale(1.05)`;
        });

        //resets animation
        foodItem.addEventListener('mouseleave', () => {
            foodItem.style.transform = 'none';  
        });

        // Add click handler for recipe details
        foodItem.addEventListener('click', () => getRecipeDetails(meal.idMeal));

        resultsContainer.appendChild(foodItem);
    });

    // Start floating animation
    // startFloatingAnimation();
}

//RECIPE DETAILS 

async function getRecipeDetails(mealId) {       //Clears previous result and Displays the message
    resultsContainer.innerHTML = '<div class="loading">Loading recipe details...</div>';

    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
        const data = await response.json(); //converson
        const meal = data.meals[0]; //Since the API always returns an array of meals, data.meals[0] extracts the first meal.




        /*
        <h2>${meal.strMeal}</h2>                                    //recipe name
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}">      //recipe image
        <h3>Ingredients</h3>                                        //listing ingredients
        ${getIngredientsList(meal)}                             <!-- Function generates the list dynamically -->

        <!-- Section for displaying cooking instructions -->
        <h3>Instructions</h3>
        <p>${meal.strInstructions}</p>
        */
        resultsContainer.innerHTML = `
            <div class="recipe-details" style="grid-column: 1/-1;">
                <h2>${meal.strMeal}</h2>    
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                <h3>Ingredients</h3>
                <ul>
                    ${getIngredientsList(meal)}     
                </ul>
                <h3>Instructions</h3>
                <p>${meal.strInstructions}</p>
                <button class="back-button" onclick="searchRecipes()">Back to Results</button>
            </div>
        `;

    } catch (error) {
        resultsContainer.innerHTML = '<div style="text-align: center; grid-column: 1/-1;">Error loading recipe details. Please try again later.</div>';
    }
}


//EXTRACTING INGREDIENTS
function getIngredientsList(meal) {
    let ingredients = '';
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ingredient && ingredient.trim() !== '') {
            ingredients += `<li>${ingredient} - ${measure}</li>`;
        }
    }
    return ingredients;
}
