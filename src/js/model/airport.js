'use strict';

import {AIRLABS_API_URL, AIRLABS_KEY} from "../config.js";
import {AJAX, removeDuplicates} from "../helpers.js";
import {loadCity} from "./city.js";
import {loadCountry} from "./country.js";
import {loadAirportWeather} from "./weather.js";

export const state = {
    selectedAirport: {},
    originDestinationAirport: {},
    search: {
        query: '',
        results: [],
    },
};

export const loadSearchResults = async function (query, abortController, cancelSearch) {
    try {
        state.search.query = query;
        state.search.results = [];

        if (abortController) abortController.abort();
        abortController = new AbortController();
        let signal = abortController.signal;
        if (cancelSearch) return;

        let data = await AJAX(`${AIRLABS_API_URL}suggest?api_key=${AIRLABS_KEY}&search=${query}&lang=es`, true, signal);
        state.search.results.push(...[...data.response.airports, ...data.response.airports_by_cities, ...data.response.airports_by_countries]);
        state.search.results = removeDuplicates(state.search.results);

        let cities = [...data.response.cities, ...data.response.cities_by_airports, ...data.response.cities_by_countries];
        cities = removeDuplicates(cities);
        state.search.results.forEach(airport => airport.city = cities.find(c => c.city_code === airport.city_code));

        let unmatchedCityCodes = cities
            .map(city => city.city_code)
            .filter(code => !state.search.results.map(airport => airport.city?.city_code).some(airportCityCode => airportCityCode === code));

        for (const cityCode of unmatchedCityCodes) {
            data = await AJAX(`${AIRLABS_API_URL}airports?api_key=${AIRLABS_KEY}&city_code=${cityCode}&lang=es`, true, signal);
            if (data.response !== undefined && data.response.length > 0) {
                state.search.results.push(...data.response);
            }
        }

        data = await AJAX(`${AIRLABS_API_URL}airports?api_key=${AIRLABS_KEY}&iata_code=${query}&lang=es`, true, signal);
        let airportsByIataAndIcao = data.response;
        data = await AJAX(`${AIRLABS_API_URL}airports?api_key=${AIRLABS_KEY}&icao_code=${query}&lang=es`, true, signal);
        airportsByIataAndIcao.push(...data.response);
        airportsByIataAndIcao = removeDuplicates(airportsByIataAndIcao.flat(1));

        airportsByIataAndIcao.forEach(airport => {
            const index = state.search.results.findIndex(a => a.iata_code === airport.iata_code);
            if (index > -1) {
                state.search.results.splice(index, 1);
                state.search.results.push(airport);
            } else state.search.results.push(airport);
        });

        state.search.results = state.search.results.filter(airport => airport.iata_code !== undefined)
    } catch (err) {
        console.log(`${err.status} - ${err.message}`);
        throw err;
    }
}

export const loadAirport = async function (iata) {
    try {
        state.selectedAirport = {};
        let data = await AJAX(`${AIRLABS_API_URL}airports?api_key=${AIRLABS_KEY}&iata_code=${iata}&lang=es`);
        state.selectedAirport = data.response[0];
        state.selectedAirport.city = await loadCity(state.selectedAirport.city_code);
        state.selectedAirport.country = await loadCountry(state.selectedAirport.country_code);
        state.selectedAirport.weather = await loadAirportWeather(state.selectedAirport.lat, state.selectedAirport.lng);
    } catch (err) {
        console.log(`${err.status} - ${err.message}`);
        throw err;
    }
};

export const loadOriginDestinationAirports = async function (iata) {
    try {
        state.originDestinationAirport = {};
        let data = await AJAX(`${AIRLABS_API_URL}airports?api_key=${AIRLABS_KEY}&iata_code=${iata}&lang=es`);
        state.originDestinationAirport = data.response[0];
        state.originDestinationAirport.city = await loadCity(state.originDestinationAirport.city_code);
        state.originDestinationAirport.country = await loadCountry(state.originDestinationAirport.country_code);
    } catch (err) {
        console.log(`${err.status} - ${err.message}`);
        throw err;
    }
};