class SearchView {
  #parentEl = document.querySelector('.search');

  /** GET THE SEARCH KEY INPUT BY USER */
  getQuery() {
    const query = this.#parentEl.querySelector('.search__field').value;
    // Empty Input
    this.#clearInput();
    return query;
  }

  #clearInput() {
    this.#parentEl.querySelector('.search__field').value = '';
  }

  addHandlerSearch(handler) {
    this.#parentEl.addEventListener('submit', function (e) {
      // Prevent form from reloading
      e.preventDefault();
      handler();
    });
  }
}

export default new SearchView();
