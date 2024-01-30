'use strict';

import {AIRLABS_API_URL, AIRLABS_KEY} from "../config.js";
import {AJAX, sortFlightsByDepartureTime} from "../helpers.js";

export const state = {
    selectedFlight: {},
    arrivals: {
        iata: '',
        results: []
    },
    departures: {
        iata: '',
        results: []
    },
};

export const loadArrivals = async function (iata) {
    try {
        state.arrivals.iata = iata;
        state.arrivals.results = [];

        let data = await AJAX(`${AIRLABS_API_URL}schedules?api_key=${AIRLABS_KEY}&arr_iata=${iata}&lang=es`, false);
        state.arrivals.results.push(...data.response);

        if (state.arrivals.results.length > 0) {
            data = await AJAX(`${AIRLABS_API_URL}flights?api_key=${AIRLABS_KEY}&arr_iata=${iata}&lang=es`, false);

            const liveFlightsIataCodes = data.response
                .filter(f => f.status === 'en-route')
                .map(f => f.flight_iata);

            liveFlightsIataCodes.forEach(code => {
                const matchingFlightIndex = state.arrivals.results.findIndex(f => f.flight_iata === code);
                if (matchingFlightIndex !== -1) state.arrivals.results[matchingFlightIndex].status = "en-route";
            });

            sortFlightsByDepartureTime(state.arrivals.results);
        }

    } catch (err) {
        console.log(`${err.status} - ${err.message}`);
        throw err;
    }
}

export const loadDepartures = async function (iata) {
    try {
        state.departures.iata = iata;
        state.departures.results = [];

        let data = await AJAX(`${AIRLABS_API_URL}schedules?api_key=${AIRLABS_KEY}&dep_iata=${iata}&lang=es`, false);
        state.departures.results.push(...data.response);

        if (state.departures.results.length > 0) {
            data = await AJAX(`${AIRLABS_API_URL}flights?api_key=${AIRLABS_KEY}&dep_iata=${iata}&lang=es`, false);

            const liveFlightsIataCodes = data.response
                .filter(f => f.status === 'en-route')
                .map(f => f.flight_iata);

            liveFlightsIataCodes.forEach(code => {
                const matchingFlightIndex = state.departures.results.findIndex(f => f.flight_iata === code);
                if (matchingFlightIndex !== -1) state.departures.results[matchingFlightIndex].status = "en-route";
            });

            sortFlightsByDepartureTime(state.departures.results);
        }
    } catch (err) {
        console.log(`${err.status} - ${err.message}`);
        throw err;
    }
}

export const updateFlightLocation = async function (flightIata) {
    try {
        let data = await AJAX(`${AIRLABS_API_URL}flights?api_key=${AIRLABS_KEY}&flight_iata=${flightIata}&lang=es`, false);
        state.selectedFlight.live = data.response[0];
    } catch (err) {
        console.log(`${err.status} - ${err.message}`);
        throw err;
    }
}

export const filterFlightsByIataCode = function (iata, flightType) {
    if (flightType === 'arrival') {
        return state.arrivals.results.find(flight => flight.flight_iata === iata);
    } else if (flightType === 'departure') {
        return state.departures.results.find(flight => flight.flight_iata === iata);
    }
}