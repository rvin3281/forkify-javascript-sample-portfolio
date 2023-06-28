import { async } from 'regenerator-runtime';
/** Name Import -> We use curly braces */
import { API_URL, RES_PER_PAGE, KEY } from './config.js';
// import { getJSON, sendJSON } from './helpers.js';
import { AJAX } from './helpers.js';

/** STATE
 *  - Contains all the data we need in order to build our application
 */

/** Named exports */
export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    page: 1,
    resultsPerPage: RES_PER_PAGE,
  },
  bookmarks: [],
};

const createRecipeObject = function (data) {
  const { recipe } = data.data;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    /** - If recipe.key is truthy (e.g., it has a value), the expression
     * { key: recipe.key } is evaluated and returns an object
     * with the property key set to the value of recipe.key.
     *  - When the expression is truthy, the spread syntax ... is used to
     * spread the resulting object { key: recipe.key } into the
     * containing object or array. */
    ...(recipe.key && { key: recipe.key }),
  };
};

/** Controller will get the ID and pass to model
 *  - This function wont return anything, but change the state object
 */
/** Named exports */
export const loadRecipe = async function (id) {
  try {
    // Await that promise and store that resolved value into the data variable
    const data = await AJAX(`${API_URL}${id}?key=${KEY}`);
    state.recipe = createRecipeObject(data);

    if (state.bookmarks.some(bookmark => bookmark.id === id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;

    console.log(state.recipe);
  } catch (err) {
    // Temperary error handling
    // console.log(`${err} 💕`);
    throw err;
  }
};

/** Implement Search Functionality
 *  - Ajax call -> Async Functions
 *  - This function will be called by controller
 *  - Controller is the one will tell what actually to search for
 *  - Error Handling -> throw err (We able to use this err in the controller)
 */
export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;
    /** Use Helper getJson method */
    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);
    console.log(data);

    // data.data.recipes -> this is the array of all objects

    /** Create a new array which contains new object
     *  where the property names are different */
    state.search.results = data.data.recipes.map(rec => {
      // Return new object
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }),
      };
    });
    state.search.page = 1;
    // console.log(state.search.results);
  } catch (err) {
    throw err;
  }
};
// loadSearchResults('pizza'); -> Testing

export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;

  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;

  return state.search.results.slice(start, end);
};

/** UPDATE SEVING FUNCTIONS
 *  - parameter 1 - Number of serving
 * This function will reach into the state and into recipe ingredient and change the quantity in each ingredient
 */
export const updateServings = function (newServings) {
  // Each ingredient we change the quantity
  // If we need to new array, then we can use map
  state.recipe.ingredients.forEach(ing => {
    /** Formula to calculate new Quantity
     * newQt = oldQt * newServings / oldServings // 2 * 8 / 4 = 4
     */
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
  });

  state.recipe.servings = newServings;
};

/** Store on local storage */
const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

export const addBookmark = function (recipe) {
  // Add Bookmark
  state.bookmarks.push(recipe);

  // Mark current recipe as bookmark
  /** Once we click on the bookmark on the UI
   *  Then pass the recipe data on this method
   *  If the received recipe.id is equal to current state recipe id, then new property will add with true
   */
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

  persistBookmarks();
};

export const deleteBookmark = function (id) {
  // Delete Bookmark
  const index = state.bookmarks.findIndex(el => el.id === id);
  state.bookmarks.splice(index, 1);

  // Mark current recipe not bookmarked
  if (id === state.recipe.id) state.recipe.bookmarked = false;

  persistBookmarks();
};

const init = function () {
  const storage = localStorage.getItem('bookmarks');

  // JSON.parse -> Convert string to Object
  if (storage) state.bookmarks = JSON.parse(storage);
};
init();
// console.log(state.bookmarks);

const clerarBookmarks = function () {
  localStorage.clear('bookmarks');
};
// clerarBookmarks();

/** UPLOAD DATA TO FORKIFY API
 *  - This will eventually make a request to the API
 *  - Therefore this must be an async function
 */
export const uploadRecipe = async function (newRecipe) {
  try {
    /** 1st task
     *  - Take the raw input data
     *  - Transform it into the same format as the data that we also get out of the API
     */

    /** Using a map method -> map is always good to create new arrays based on some existing data
     *  - To use map we must use array
     *  - Use Object.entries() - To convert to array from object
     *  - Use map method after filtered from the array, to store each array element separately
     */
    // console.log(Object.entries(newRecipe));
    //  Use Filter -> Because we only need ingredient 1,2,3,...
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        // replaceAll -> Replace spaces with empty string
        const ingArr = ing[1].split(',').map(el => el.trim())

        if (ingArr.length !== 3)
          throw new Error(
            'Wrong ingredient Format! Please use the correct format'
          );

        const [quantity, unit, description] = ingArr;
        return { quantity: quantity ? +quantity : null, unit, description };
      });

    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };

    /** PASS DATA TO SEND TO API AS JSON FORMAT */
    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);

    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};
