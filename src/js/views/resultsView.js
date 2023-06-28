/** IMPORT PARENT CLASS */
import View from './View.js';
import previewView from './previewView.js';

import icons from 'url:../../img/icons.svg';

class ResultView extends View {
  _parentElement = document.querySelector('.results');
  _errorMessage = 'No recipes found for your query! Please Try Again';
  _message = '';

  _generateMarkup() {
    console.log(this._data); // -> model.state.search.results
    return this._data
      .map(result => previewView.render(result, false))
      .join('');
  }
}

export default new ResultView();
