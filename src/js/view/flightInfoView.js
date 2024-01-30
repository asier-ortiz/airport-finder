'use strict';

import icons from 'url:../../img/icons.svg';
import {convertMinutesToHoursAndMinutes, formatDateToTime} from "../helpers.js";
import FlightLiveView from "./flightLiveView";

class FlightInfoView {
    #data;
    #parentElement = document.querySelector('.airport');

    addHandlerCancelFlightTracking(handler) {
        this.#parentElement.addEventListener('cancel-tracking', function (e) {
            const btn = e.target.closest('.btn--close');
            if (!btn) return;
            handler();
        });
    };

    static #clear() {
        const flightInfoSection = document.querySelector('.flight-info');
        if (typeof (flightInfoSection) != 'undefined' && flightInfoSection != null) {
            flightInfoSection.parentElement.removeChild(flightInfoSection);
        }
        FlightLiveView._clear();
    }

    #generateMarkup() {
        return `
        <button class="btn btn--round btn--close">
            <svg>
                <use xlink:href="${icons}#close"></use>
            </svg>
        </button>
         <div class="flight-info__top">
                <div class="flight-number-airline">
                    <h3>${this.#data.flight_iata}</h3>
                    <span> ${this.#data.airline.name} (${this.#data.airline_icao})</span>
                </div>
                <div class="flight-route">
                    <div class="flight-route__origin">               
                        <h3>${this.#data.dep_iata}</h3>
                        <span>${this.#data.departure_airport?.names?.es ?? this.#data.departure_airport?.name}</span>
                    </div>
                    <svg class="flight-route__icon">
                        <use xlink:href="${icons}#plane"></use>
                    </svg>
                    <div class="flight-route__destination">
                        <h3>${this.#data.arr_iata}</h3>
                        <span>${this.#data.arrival_airport?.names?.es ?? this.#data.arrival_airport?.name}</span>
                    </div>
                </div>
            </div>
            <div class="flight-info__bottom">
                <span class="route-duration">${convertMinutesToHoursAndMinutes(this.#data.duration)}</span>
                <div class="flight-info-block flight-info-block--departure">
                    <div class="flight-info-block__city-country">
                        <h3>${this.#data.departure_airport?.city?.names?.es ?? this.#data.departure_airport?.city?.name}</h3>
                        <h3>·</h3>
                        <h3>${this.#data.departure_airport?.country?.names?.es ?? this.#data.departure_airport?.country?.name}</h3>
                    </div>
                    <div class="flight-info-block__timing">
                        <div class="flight-scheduled-time flight-scheduled-time--departure">
                            <h3>Programado</h3>
                            <span>${this.#data.dep_time ? formatDateToTime(this.#data.dep_time) : '--'}</span>
                        </div>
                        <div class="flight-estimated-time flight-estimated-time--departure">
                            <h3>Estimado</h3>
                            <span>${this.#data.dep_estimated ? formatDateToTime(this.#data.dep_estimated) : '--'}</span>
                        </div>
                    </div>
                    <div class="flight-info-block__terminal-gate">
                        <div class="flight-info-terminal">
                            <span class="flight-info-terminal__title">Terminal</span>
                            <span class="flight-info-terminal__number flight-info-terminal__number--departure">${this.#data.dep_terminal ?? '--'}</span>
                        </div>
                        <div class="flight-info-gate">
                            <span class="flight-info-gate__title">Puerta</span>
                            <span class="flight-info-gate__number flight-info-gate__number--departure">${this.#data.dep_gate ?? '--'}</span>
                        </div>
                    </div>
                    <div class="flight-info-block__timezone">
                        <div class="flight-info-timezone">
                            <span class="flight-info-timezone__title">Zona horaria</span>
                            <span class="flight-info-timezone__data flight-info-timezone__data--departure">${this.#data.departure_airport.timezone ?? '--'}</span>
                        </div>
                    </div>
                </div>
                <div class="separator"></div>
                <div class="flight-info-block flight-info-block--arrival">
                    <div class="flight-info-block__city-country">
                        <h3>${this.#data.arrival_airport?.city?.names?.es ?? this.#data.arrival_airport?.city?.name}</h3>
                        <h3>·</h3>
                        <h3>${this.#data.arrival_airport?.country?.names?.es ?? this.#data.arrival_airport?.country?.name}</h3>
                    </div>
                    <div class="flight-info-block__timing">
                        <div class="flight-scheduled-time flight-scheduled-time--arrival">
                            <h3>Programado</h3>
                            <span>${this.#data.arr_time ? formatDateToTime(this.#data.arr_time) : '--'}</span>
                        </div>
                        <div class="flight-estimated-time flight-estimated-time--arrival">
                            <h3>Estimado</h3>
                            <span>${this.#data.arr_estimated ? formatDateToTime(this.#data.arr_estimated) : '--'}</span>
                        </div>
                    </div>
                    <div class="flight-info-block__terminal-gate">
                        <div class="flight-info-terminal">
                            <span class="flight-info-terminal__title">Terminal</span>
                            <span class="flight-info-terminal__number flight-info-terminal__number--arrival">${this.#data.arr_terminal ?? '--'}</span>
                        </div>
                        <div class="flight-info-gate">
                            <span class="flight-info-terminal__title">Puerta</span>
                            <span class="flight-info-terminal__number flight-info-terminal__number--arrival">${this.#data.arr_gate ?? '--'}</span>
                        </div>
                    </div>
                    <div class="flight-info-block__timezone">
                        <div class="flight-info-timezone">
                            <span class="flight-info-timezone__title">Zona horaria</span>
                            <span class="flight-info-timezone__data flight-info-timezone__data--arrival">${this.#data.arrival_airport.timezone ?? '--'}</span>
                        </div>
                    </div>
                </div>
            </div>
        `
    }

    renderSpinner() {
        const markup = `
        <div class='spinner'>
            <svg>
                <use href='${icons}#spinner'></use>
            </svg>
        </div>
        `;
        FlightInfoView.#clear();
        const flightInfoSection = document.createElement("section");
        flightInfoSection.classList.add("flight-info");
        this.#parentElement.appendChild(flightInfoSection);
        flightInfoSection.insertAdjacentHTML('beforeend', markup);
    };

    render(data) {
        if (!data || Object.keys(data).length === 0) return;
        this.#data = data;
        const markup = this.#generateMarkup();
        FlightInfoView.#clear();
        const flightInfoSection = document.createElement('section');
        flightInfoSection.classList.add('flight-info');
        this.#parentElement.appendChild(flightInfoSection);
        flightInfoSection.insertAdjacentHTML('beforeend', markup);
        const closeBtn = document.querySelector('.btn--close');
        closeBtn.addEventListener('click', e => e.target.dispatchEvent(
            new CustomEvent("cancel-tracking", {bubbles: true})
        ));
        closeBtn.addEventListener('click', FlightInfoView.#clear);
    }
}

export default new FlightInfoView();
