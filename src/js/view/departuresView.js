'use strict';

import icons from 'url:../../img/icons.svg';
import {formatDateToTime} from "../helpers.js";

class DeparturesView {
    #data;
    #parentElement = document.querySelector('.airport');

    addHandlerRender(controlDepartures) {
        ['hashchange', 'load'].forEach(e => window.addEventListener(e, controlDepartures));
    };

    addHandlerSearch(controlDeparturesSearchResults) {
        this.#parentElement.addEventListener('input--departures', function (e) {
            const input = e.detail.input();
            controlDeparturesSearchResults.apply({input: input});
        })
    }

    addHandlerFlightSelected(controlFlight, controlFlightTrack) {
        this.#parentElement.addEventListener('click', function (e) {
            const row = e.target.closest('.row--departure');
            if (!row) return;
            const flightIata = row.getAttribute('data-flightIata');
            const flightType = row.getAttribute('data-flightType');
            const arrIata = row.getAttribute('data-arrIata');
            const depIata = row.getAttribute('data-depIata');
            controlFlight(flightIata, flightType, arrIata, depIata).then(() => controlFlightTrack(flightIata));
        });
    };

    static #clear() {
        const departuresSection = document.querySelector('.departures');
        if (typeof (departuresSection) != 'undefined' && departuresSection != null) {
            departuresSection.parentElement.removeChild(departuresSection);
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
             <div class="row row--departure" 
                  data-flightIata="${flight.flight_iata}" 
                  data-flightType="departure"
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
        DeparturesView.#clear();
        const departuresSection = document.createElement("section");
        departuresSection.classList.add("departures");
        this.#parentElement.appendChild(departuresSection);
        departuresSection.insertAdjacentHTML('beforeend', markup);
    };

    render(data) {
        if (!data || (Array.isArray(data) && data.length === 0)) return;
        this.#data = data;
        const markup = this.#generateMarkup();
        DeparturesView.#clear();
        const departuresSection = document.createElement("section");
        departuresSection.classList.add("departures");
        const sectionHeader = document.createElement("div");
        sectionHeader.classList.add("section-header");
        const title = document.createElement("h3");
        title.innerText = "Salidas";
        const form = document.createElement("form");
        form.classList.add("filter");
        form.id = "form-filter-departures";
        form.autocomplete = "off";
        const formInput = document.createElement("input");
        formInput.classList.add("filter__field");
        formInput.type = "text";
        formInput.placeholder = "Busca un vuelo (IATA)";
        form.appendChild(formInput);
        sectionHeader.appendChild(title);
        sectionHeader.appendChild(form);
        formInput.addEventListener('keyup', e => e.target.dispatchEvent(
            new CustomEvent("input--departures", {
                bubbles: true,
                detail: {input: () => e.target.value}
            })
        ));
        const tableWrapper = document.createElement("div");
        tableWrapper.classList.add("table-wrapper");
        const table = document.createElement("div");
        table.classList.add("table", "table--departures");
        table.insertAdjacentHTML('beforeend', markup);
        tableWrapper.appendChild(table);
        this.#parentElement.appendChild(departuresSection);
        departuresSection.appendChild(sectionHeader);
        departuresSection.appendChild(tableWrapper);
    };

    update(data) {
        if (!data || (Array.isArray(data) && data.length === 0)) return;
        this.#data = data;
        const markup = this.#generateMarkup();
        const table = document.querySelector('.table--departures');
        table.innerHTML = '';
        table.insertAdjacentHTML('afterbegin', markup);
    }

    filterTable(input) {
        input = input.trim().toUpperCase();
        const rows = document.querySelectorAll('.row--departure');
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

export default new DeparturesView();