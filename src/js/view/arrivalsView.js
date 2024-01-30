'use strict';

import icons from 'url:../../img/icons.svg';
import {formatDateToTime} from "../helpers.js";

class ArrivalsView {
    #data;
    #parentElement = document.querySelector('.airport');

    addHandlerRender(controlArrivals) {
        ['hashchange', 'load'].forEach(e => window.addEventListener(e, controlArrivals));
    };

    addHandlerSearch(controlArrivalsSearchResults) {
        this.#parentElement.addEventListener('input--arrivals', function (e) {
            const input = e.detail.input();
            controlArrivalsSearchResults.apply({input: input});
        })
    }

    addHandlerFlightSelected(controlFlight, controlFlightTrack) {
        this.#parentElement.addEventListener('click', function (e) {
            const row = e.target.closest('.row--arrival');
            if (!row) return;
            const flightIata = row.getAttribute('data-flightIata');
            const flightType = row.getAttribute('data-flightType');
            const arrIata = row.getAttribute('data-arrIata');
            const depIata = row.getAttribute('data-depIata');
            controlFlight(flightIata, flightType, arrIata, depIata).then(() => controlFlightTrack(flightIata));
        });
    };

    static #clear() {
        const arrivalsSection = document.querySelector('.arrivals');
        if (typeof (arrivalsSection) != 'undefined' && arrivalsSection != null) {
            arrivalsSection.parentElement.removeChild(arrivalsSection);
        }
    }

    #generateMarkup() {
        const header = `
            <div class="table__header">
                <div class="cell">HORA</div>
                <div class="cell">VUELO</div>
                <div class="cell">ORIGEN</div>
                <div class="cell">AEROLINEA</div>
                <div class="cell">STATUS</div>
                <div class="cell">LIVE</div>
            </div>`;
        const rows = this.#data.results.map(flight => {
            return `
             <div class="row row--arrival" 
                  data-flightIata="${flight.flight_iata}" 
                  data-flightType="arrival"
                  data-arrIata="${flight.arr_iata}"
                  data-depIata="${flight.dep_iata}"
                  data-isLive="${flight.status === 'en-route'}"
             >
                <div class="cell cell--time">
                    ${(() => {
                        if (flight.arr_time !== flight.arr_estimated && flight.arr_estimated !== undefined) {
                            return `
                                    <span>${formatDateToTime(flight.arr_estimated)}</span>
                                    <span class="line-through">${formatDateToTime(flight.arr_time)}</span>
                                    `
                        } else
                            return `<span>${formatDateToTime(flight.arr_time)}</span>`;
                    })()}
                </div>
                <div class="cell cell--flightNumber">${flight.flight_iata}</div>
                <div class="cell cell--origin">${flight.dep_iata}</div>
                <div class="cell cell--carrier">
                    <img src="https://pics.avs.io/200/200/${flight.airline_iata}.png" alt="${flight.airline_iata}"/>
                </div>
                <div class="cell cell--${flight.status}">${flight.status}</div>
                <div class="cell">
                    ${(() => {return flight.status === 'en-route' ? `<div class="dot"></div>` : ``;})()}
                </div>
             </div>
            `;
        }).join('');
        return [header, rows].join('');
    };

    renderSpinner() {
        const markup = `
        <div class='spinner'>
            <svg>
                <use href='${icons}#spinner'></use>
            </svg>
        </div>
        `;
        ArrivalsView.#clear();
        const arrivalsSection = document.createElement("section");
        arrivalsSection.classList.add("arrivals");
        this.#parentElement.appendChild(arrivalsSection);
        arrivalsSection.insertAdjacentHTML('beforeend', markup);
    };

    render(data) {
        if (!data || (Array.isArray(data) && data.length === 0)) return;
        this.#data = data;
        const markup = this.#generateMarkup();
        ArrivalsView.#clear();
        const arrivalsSection = document.createElement("section");
        arrivalsSection.classList.add("arrivals");
        const sectionHeader = document.createElement("div");
        sectionHeader.classList.add("section-header");
        const title = document.createElement("h3");
        title.innerText = "Llegadas";
        const form = document.createElement("form");
        form.classList.add("filter");
        form.id = "form-filter-arrivals";
        form.autocomplete = "off";
        const formInput = document.createElement("input");
        formInput.classList.add("filter__field");
        formInput.type = "text";
        formInput.placeholder = "Busca un vuelo (IATA)";
        form.appendChild(formInput);
        sectionHeader.appendChild(title);
        sectionHeader.appendChild(form);
        formInput.addEventListener('keyup', e => e.target.dispatchEvent(
            new CustomEvent("input--arrivals", {
                bubbles: true,
                detail: {input: () => e.target.value}
            })
        ));
        const tableWrapper = document.createElement("div");
        tableWrapper.classList.add("table-wrapper");
        const table = document.createElement("div");
        table.classList.add("table", "table--arrivals");
        table.insertAdjacentHTML('beforeend', markup);
        tableWrapper.appendChild(table);
        this.#parentElement.appendChild(arrivalsSection);
        arrivalsSection.appendChild(sectionHeader);
        arrivalsSection.appendChild(tableWrapper);
    };

    update(data) {
        if (!data || (Array.isArray(data) && data.length === 0)) return;
        this.#data = data;
        const markup = this.#generateMarkup();
        const table = document.querySelector('.table--arrivals');
        table.innerHTML = '';
        table.insertAdjacentHTML('afterbegin', markup);
    }

    filterTable(input) {
        input = input.trim().toUpperCase();
        const rows = document.querySelectorAll('.row--arrival');
        [...rows].forEach(function (row) {
            const text = row.childNodes[3].innerText;
            if (text.toUpperCase().indexOf(input) > -1) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        });
    }
}

export default new ArrivalsView();