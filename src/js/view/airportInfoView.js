'use strict';

import icons from 'url:../../img/icons.svg';
import {convertFeetToMeters} from "../helpers.js";

class AirportInfoView {
    #data;
    #weatherData;
    #parentElement = document.querySelector('.airport');

    addHandlerRender(controlAirports) {
        ['hashchange', 'load'].forEach(e => window.addEventListener(e, controlAirports));
    };

    static #clear() {
        const welcomeMsg = document.querySelector('.welcome-msg');
        if (typeof (welcomeMsg) != 'undefined' && welcomeMsg != null)
            welcomeMsg.parentElement.removeChild(welcomeMsg);

        const airportHeaderSection = document.querySelector('.airport-header');
        if (typeof (airportHeaderSection) != 'undefined' && airportHeaderSection != null)
            airportHeaderSection.parentElement.removeChild(airportHeaderSection);

        const flightInfoSection = document.querySelector('.flight-info');
        if (typeof (flightInfoSection) != 'undefined' && flightInfoSection != null)
            flightInfoSection.parentElement.removeChild(flightInfoSection);

        const flightLiveSection = document.querySelector('.flight-live');
        if (typeof (flightLiveSection) != 'undefined' && flightLiveSection != null)
            flightLiveSection.parentElement.removeChild(flightLiveSection);
    }

    #generateMarkup() {
        return `
        <div class="airport-header__text-box">
            <h2 class="heading">
                <span class="heading--main">${this.#data.names?.es ?? this.#data.name}</span>
                <span class="heading--sub">${this.#data.city?.names?.es ?? this.#data.city?.name} / ${this.#data.country?.names?.es ?? this.#data.country?.name}</span>
            </h2>
        </div>
        <div class="weather">
            <div class="weather__info">
                <img src="https://openweathermap.org/img/wn/${this.#data.weather.weather[0].icon}@2x.png" class="weather__icon weather__icon--temperature" 
                     alt="${this.#data.weather.weather[0].description}">
                <span class="weather__data weather__data--temperature">${~~this.#data.weather.main.temp ?? '--'}<small>ºC</small></span>
            </div>
            <div class="weather__info">
                <svg class="weather__icon weather__icon--wind">
                    <use xlink:href="${icons}#arrow"></use>
                </svg>
                <span class="weather__data weather__data--wind">${this.#data.weather?.wind.speed ?? '--'}<small>KM/H</small></span>
            </div>
        </div>
        <button class="btn btn--round btn--info">
            <svg>
                <use xlink:href="${icons}#info"></use>
            </svg>
        </button>
        <div class="airport-header__info">
            <div class="info-row">
                    <div class="info-row__title">
                        <span>Identificador</span>
                        <svg>
                            <use xlink:href="${icons}#identifier"></use>
                        </svg>
                    </div>
                    <span class="info-row__value">${this.#data.iata_code ?? '--'}</span>
            </div>
            <div class="info-row">
                <div class="info-row__title">
                    <span>Teléfono</span>
                    <svg>
                        <use xlink:href="${icons}#phone"></use>
                   </svg>
                </div>
                <span class="info-row__value">${this.#data.phone_formatted ?? '--'}</span>
            </div>
            <div class="info-row">
                <div class="info-row__title">
                    <span>Zona horaria</span>
                    <svg>
                        <use xlink:href="${icons}#time"></use>
                    </svg>
                </div>
                <span class="info-row__value">${this.#data.timezone ?? '--'}</span>
            </div>
            <div class="info-row">
                <div class="info-row__title">
                    <span>Pistas</span>
                    <svg>
                        <use xlink:href="${icons}#runaway"></use>
                    </svg>
                </div>
                <span class="info-row__value">${this.#data.runways ?? '--'}</span>
            </div>
            <div class="info-row">
                <div class="info-row__title">
                    <span>Elevación</span>
                    <svg>
                        <use xlink:href="${icons}#altitude"></use>
                    </svg>
                </div>
                <span class="info-row__value">${this.#data.alt ? convertFeetToMeters(this.#data.alt) + ' Metros' : '--'}</span>
            </div>
            <div class="info-row">
                <div class="info-row__title">
                    <span>Vuelos anuales</span>
                    <svg>
                        <use xlink:href="${icons}#take-off"></use>
                    </svg>
                </div>
                <span class="info-row__value">${this.#data.departures ?? '--'}</span>
            </div>
            <div class="info-row">
                <div class="info-row__title">
                    <span>Conexiones</span>
                    <svg>
                        <use xlink:href="${icons}#connections"></use>
                    </svg>
                </div>
                <span class="info-row__value">${this.#data.connections ?? '--'}</span>
            </div>
        </div> 
        `
    };

    renderSpinner() {
        const markup = `
        <div class='spinner'>
            <svg>
                <use href='${icons}#spinner'></use>
            </svg>
        </div>
        `;
        AirportInfoView.#clear();
        const airportHeaderSection = document.createElement("section");
        airportHeaderSection.classList.add("airport-header");
        this.#parentElement.appendChild(airportHeaderSection);
        airportHeaderSection.insertAdjacentHTML('beforeend', markup);
    };

    render(data) {
        if (!data || Object.keys(data).length === 0) return;
        this.#data = data;
        AirportInfoView.#clear();
        const markup = this.#generateMarkup();
        const airportHeaderSection = document.createElement("section");
        airportHeaderSection.classList.add("airport-header");
        this.#parentElement.appendChild(airportHeaderSection);
        airportHeaderSection.insertAdjacentHTML('beforeend', markup);
        const weatherIconWindEl = document.querySelector('.weather__icon--wind');
        weatherIconWindEl.style.transform = `rotate(${this.#data.weather.wind.deg}deg)`;
    };

    update(data) {
        if (!data || Object.keys(data).length === 0) return;
        this.#weatherData = data;
        const weatherIconTempEl = document.querySelector('.weather__icon--temperature');
        weatherIconTempEl.src = `https://openweathermap.org/img/wn/${this.#weatherData.weather[0].icon}@2x.png`;
        const weatherDataTempEl = document.querySelector('.weather__data--temperature');
        weatherDataTempEl.innerHTML = `${~~this.#weatherData.main.temp ?? '--'}<small>ºC</small>`;
        const weatherIconWindEl = document.querySelector('.weather__icon--wind');
        weatherIconWindEl.style.transform = `rotate(${this.#weatherData.wind.deg}deg)`;
        const weatherDataWindEl = document.querySelector('.weather__data--wind');
        weatherDataWindEl.innerHTML = `${~~this.#weatherData.wind.speed ?? '--'}<small>KM/H</small>`;
    }
}

export default new AirportInfoView();