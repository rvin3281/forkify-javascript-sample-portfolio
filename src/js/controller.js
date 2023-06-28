/** IMPORT MODEL */
import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
/** IMPORT FROM VIEW */
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

// The path of original icon file
// In parcel 2, if anything not programming files like images, sound, video
// - We need to include url:

import 'core-js/stable'; //Polyfilling for everything elsenpms
import 'regenerator-runtime/runtime'; // Polyfilling async/await
import { async } from 'regenerator-runtime';

/** HOT MODULE RELOADING
 *  - Prevent Auto Reloding
 */
if (module.hot) {
  module.hot.accept();
}

const recipeContainer = document.querySelector('.recipe');

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

/** MAKE API REQUEST
 *  - USING ASYNC FUNCTION WITH AWAIT
 *  - On async function we must use try..catch block
 *  - On catch we need to get the Error
 */
const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    console.log(id);

    /** USE GUARD CLAUSE TO RETURN IF THERE IS NO ID THEN RETURN FUNCTION */
    if (!id) return;
    recipeView.renderSpinner();

    // 0) Update result view to mark selected search result
    resultsView.update(model.getSearchResultsPage());

    // 1) Updating Bookmark View
    // debugger;
    bookmarksView.update(model.state.bookmarks);

    /** 2. Loading Recipe
     * Call the function
     * load function is an async function, therefore going to return a promise
     * So, we have to await that promise, Hence we no need to use variable to store the promise
     */
    await model.loadRecipe(id);

    /** 3) Rendering Recipe */
    recipeView.render(model.state.recipe);
  } catch (err) {
    // alert(`${err} controller`);
    recipeView.renderError();
    console.log(err);
  }
};

/** This will call async function load search results */
const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    // console.log(resultsView);

    // 1) Get Search Query
    const query = searchView.getQuery();
    // If query is empty or null, then return erro message
    if (!query) return resultsView.render(query);

    // 2) Load Search Result
    await model.loadSearchResults(query); // This doesnt return anything

    // 3) Render Results
    /** Previously all the result will be displayed */
    /** resultsView.render(model.state.search.results); */
    /** Now only display some result */
    resultsView.render(model.getSearchResultsPage());
    // console.log(model.state.search.results);

    // 4) Render Initial Pagination button
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  // 1) Render New Results
  /** Previously all the result will be displayed */
  /** resultsView.render(model.state.search.results); */
  /** Now only display some result */
  resultsView.render(model.getSearchResultsPage(goToPage));
  // console.log(model.state.search.results);

  // 2) Render New Pagination button
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // Update the recipe servings (in state)
  model.updateServings(newServings);

  // Update the recipe view
  // recipeView.render(model.state.recipe);
  /** Update Method -> Only update text and attribute in the DOM with re-render the entire view  */
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // 1) Add/Remove Bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // 2) Update the recipe View
  recipeView.update(model.state.recipe);

  // 3)Render Bookmark
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // Show Loading Spinner
    addRecipeView.renderSpinner();

    // Upload the new Recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    recipeView.render(model.state.recipe);

    // Success Message
    addRecipeView.renderMessage();

    // Render bookmark View
    bookmarksView.render(model.state.bookmarks);

    /** Use History API to change the ID of URL
     *  - pushState() - allow us to change the URL without reloading the page
     *  - pushState()- takes three arguments
     *  - 1st -> state or null
     *  - 2nd -> title or '' (empty string)
     *  - 3rd -> URL (important argument)
     */
    // Change ID in the url
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    // window.history.back() ->Automatically goes to the last page

    // Close Form Window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.log('💕', err);
    addRecipeView.renderError(err.message);
  }
};

const newFeature = function () {
  console.log('Welcome to application');
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  newFeature();
};
init();

/** THIS CODE WILL GET THE CHANGES ON URL # WHICH COMMONLY USED ON SINGLE PAGE */
// window.addEventListener('hashchange', controlRecipes);
// window.addEventListener('load', controlRecipes);
