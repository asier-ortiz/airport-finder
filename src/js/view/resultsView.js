'use strict';

import icons from 'url:../../img/icons.svg';
import {highlightSearchMatches} from "../helpers.js";

class ResultsView {
    #data;
    #parentElement = document.querySelector('.search-results');

    #clear() {
        this.#parentElement.innerHTML = '';
    }

    #generateMarkup() {
        const query = this.#data.query;
        return this.#data.results.map(result => {
            const iata = `${result.iata_code}`;
            const markup = `
            <li class="preview">
                <a class="preview__link" href="#${iata}">
                <svg class="preview__icon">
                        <use xlink:href="${icons}#airport"></use>
                    </svg>
                    <div class="preview__data">
                        <h4 class="preview__title">${result.name}</h4>
                        <p class="preview__code">${result.iata_code}</p>
                        <small class="preview__location">${result.city?.name ?? result.city_code} - ${result.country_code}</small>
                    </div>
                </a>
            </li>
            `;
            const firstMarkupSlice = markup.substring(0, markup.indexOf('<svg') - 1);
            let secondMarkupSlice = markup.substring(markup.indexOf('<svg') - 1, markup.lastIndexOf('>'));
            secondMarkupSlice = highlightSearchMatches(query, secondMarkupSlice);
            return [firstMarkupSlice, secondMarkupSlice].join('');
        }).join('');
    };

    renderSpinner() {
        const markup = `
        <div class='spinner spinner--top'>
            <svg>
                <use href='${icons}#spinner'></use>
            </svg>
        </div>
        `;
        this.#clear();
        this.#parentElement.insertAdjacentHTML('beforeend', markup);
    };

    render(data) {
        if (!data.results || (Array.isArray(data.results) && data.results.length === 0)) {
            this.#clear();
            return;
        }
        this.#data = data;
        this.#clear();
        const markup = this.#generateMarkup();
        const h3 = document.createElement('h3');
        h3.classList.add('search-results__title');
        h3.innerText = "Resultados de búsqueda";
        this.#parentElement.appendChild(h3);
        const ul = document.createElement('ul');
        ul.classList.add('results');
        ul.insertAdjacentHTML('afterbegin', markup);
        this.#parentElement.appendChild(ul);
    };
}

export default new ResultsView();