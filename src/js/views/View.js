/** PARENT CLASS */

import icons from 'url:../../img/icons.svg';

/** DEFAULT EXPORT - Class
 *  - Export class because we are not goingot create any instances
 */
export default class View {
  _data;

  /**
   * Render the received object to the DOM
   * @param {object | Object[]} data The data to be rendered (e.g recipe)
   * @param {boolean} [render=true] If false, create markup string instead of rendering to the DOM
   * @returns {undefined | string} A markup string is returned if render = false
   * @this {Object} View object
   * @author Arvend Rajan
   * @todo Finish implementation
   */
  render(data , render = true) {
    /** If there is no data OR if there is data but that data is an array AND it is empty */
    if (!data || (Array.isArray(data) && data.length === 0))
      return this.renderError();
    // console.log(data);

    this._data = data;
    const markup = this._generateMarkup();

    if(!render) return markup;

    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  update(data) {
    // console.log(data);

    this._data = data;
    const newMarkup = this._generateMarkup();

    const newDOM = document.createRange().createContextualFragment(newMarkup);
    const newElements = Array.from(newDOM.querySelectorAll('*'));

    /** GET CURRENT DOM ELEMENT
     *  - Array.from() -> Convert Node List to Array Format
     */
    const curElement = Array.from(this._parentElement.querySelectorAll('*'));

    newElements.forEach((newEl, i) => {
      const curEl = curElement[i];
      // console.log(curEl, newEl.isEqualNode(curEl));

      // Updates changed TEXT
      if (
        !newEl.isEqualNode(curEl) &&
        newEl.firstChild?.nodeValue.trim() !== ''
      ) {
        // console.log('❤️', newEl.firstChild.nodeValue.trim());
        curEl.textContent = newEl.textContent;
      }

      // Updates Changed Attributes
      if (!newEl.isEqualNode(curEl)) {
        // console.log(Array.from(newEl.attributes));
        Array.from(newEl.attributes).forEach(attr =>
          curEl.setAttribute(attr.name, attr.value)
        );
      }
    });
  }

  _clear() {
    // console.log(this._parentElement);
    this._parentElement.innerHTML = '';
  }

  renderSpinner() {
    const markup = `
        <div class="spinner">
            <svg>
              <use href="${icons}#icon-loader"></use>
            </svg>
          </div>
    `;
    /** REMEMBER TO CLEAR THE PARENT ELEMENT */
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  /** Error Handling method */
  renderError(message = this._errorMessage) {
    const markup = `
      <div class="error">
        <div>
          <svg>
              <use href="${icons}#icon-alert-triangle"></use>
          </svg>
        </div>
            <p>${message}</p>
      </div>
    `;
    /** REMEMBER TO CLEAR THE PARENT ELEMENT */
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  /** Success Handling method */
  renderMessage(message = this._message) {
    const markup = `
      <div class="message">
        <div>
          <svg>
              <use href="${icons}#icon-smile"></use>
          </svg>
        </div>
            <p>${message}</p>
      </div>
    `;
    /** REMEMBER TO CLEAR THE PARENT ELEMENT */
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }
}
