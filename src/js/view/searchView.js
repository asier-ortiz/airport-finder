'use strict';

class SearchView {
    #parentElement = document.querySelector('.search');

    getQuery() {
        return this.#parentElement.querySelector('.search__field').value.trim();
    }

    addHandlerSearch(controlSearchResults) {
        this.#parentElement.addEventListener('submit', function (e) {
            e.preventDefault();
        });

        this.#parentElement.querySelector('.search__field').addEventListener('input', function () {
            controlSearchResults();
        });
    };
}

export default new SearchView();