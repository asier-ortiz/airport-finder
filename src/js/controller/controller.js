'use strict';

import * as airline from '../model/airline.js';
import * as airport from '../model/airport.js';
import * as flight from '../model/flight.js';
import * as plan from "../model/plan.js";
import * as weather from "../model/weather.js";

import airportInfoView from "../view/airportInfoView.js";
import arrivalsView from "../view/arrivalsView.js";
import departuresView from "../view/departuresView.js";
import flightInfoView from "../view/flightInfoView.js";
import resultsView from "../view/resultsView.js";
import searchView from "../view/searchView.js";
import flightLiveView from "../view/flightLiveView.js";
import {WEATHER_UPDATE_INTERVAL_SEC, FLIGHTS_UPDATE_INTERVAL_SEC, FLIGHT_TRACK_UPDATE_INTERVAL_SEC} from "../config.js";

let weatherUpdateIntervalID;
let arrivalsUpdateIntervalID;
let departuresUpdateIntervalID;
let flightTrackIntervalID;
let abortController;

const controlSearchResults = async function () {
    try {
        const query = searchView.getQuery();
        let cancelSearch = (!query || query.length < 3);
        resultsView.renderSpinner();
        await airport.loadSearchResults(query, abortController, cancelSearch);
        resultsView.render(airport.state.search);
    } catch (err) {
        console.log(err);
    }
};

const controlAirports = async function () {
    try {
        if (weatherUpdateIntervalID) clearInterval(weatherUpdateIntervalID);
        if (arrivalsUpdateIntervalID) {
            clearInterval(arrivalsUpdateIntervalID);
            arrivalsUpdateIntervalID = undefined;
        }
        if (departuresUpdateIntervalID) {
            clearInterval(departuresUpdateIntervalID);
            departuresUpdateIntervalID = undefined;
        }
        if (flightTrackIntervalID) clearInterval(flightTrackIntervalID);
        let iata = window.location.hash.slice(1);
        if (!iata) return;
        airportInfoView.renderSpinner();
        await airport.loadAirport(iata).then(() => {
            airportInfoView.render(airport.state.selectedAirport);
            startWeatherUpdateInterval();
        });
    } catch (err) {
        console.log(err);
    }
};

const startWeatherUpdateInterval = async function () {
    try {
        const selectedAirport = airport.state.selectedAirport;
        if (!selectedAirport) return;
        weatherUpdateIntervalID = setInterval(() => {
            weather.loadAirportWeather(selectedAirport.lat, selectedAirport.lng)
                .then((data) => {
                    airport.state.selectedAirport.weather = data;
                    airportInfoView.update(data);
                });
        }, WEATHER_UPDATE_INTERVAL_SEC);
    } catch (err) {
        console.log(err);
    }
}

const controlArrivals = async function () {
    try {
        let iata = window.location.hash.slice(1);
        if (!iata) return;
        arrivalsView.renderSpinner();
        await flight.loadArrivals(iata).then(() => {
            arrivalsView.render(flight.state.arrivals);
            startArrivalsUpdateInterval();
        });
    } catch (err) {
        console.log(err);
    }
};

const controlDepartures = async function () {
    try {
        let iata = window.location.hash.slice(1);
        if (!iata) return;
        departuresView.renderSpinner();
        await flight.loadDepartures(iata).then(() => {
            departuresView.render(flight.state.departures);
            startDeparturesUpdateInterval();
        })
    } catch (err) {
        console.log(err);
    }
};

const startArrivalsUpdateInterval = async function () {
    if (arrivalsUpdateIntervalID) return;
    arrivalsUpdateIntervalID = setInterval(controlArrivals, FLIGHTS_UPDATE_INTERVAL_SEC);
}

const startDeparturesUpdateInterval = async function () {
    if (departuresUpdateIntervalID) return;
    departuresUpdateIntervalID = setInterval(controlDepartures, FLIGHTS_UPDATE_INTERVAL_SEC);
}

const controlArrivalsSearchResults = function () {
    arrivalsView.filterTable(this.input);
};

const controlDeparturesSearchResults = function () {
    departuresView.filterTable(this.input);
};

const controlFlight = async function (flightIata, flightType, arrIata, depIata) {
    try {
        if (flightTrackIntervalID) clearInterval(flightTrackIntervalID);
        let selectedFlight = flight.filterFlightsByIataCode(flightIata, flightType);
        if (!selectedFlight) return;
        flightInfoView.renderSpinner();
        if (flightType === 'arrival') {
            if (selectedFlight.arrival_airport === undefined) {
                selectedFlight.arrival_airport = airport.state.selectedAirport;
            }
            if (selectedFlight.departure_airport === undefined) {
                await airport.loadOriginDestinationAirports(depIata);
                selectedFlight.departure_airport = airport.state.originDestinationAirport;
            }
        } else if (flightType === 'departure') {
            if (selectedFlight.departure_airport === undefined) {
                selectedFlight.departure_airport = airport.state.selectedAirport;
            }
            if (selectedFlight.arrival_airport === undefined) {
                await airport.loadOriginDestinationAirports(arrIata);
                selectedFlight.arrival_airport = airport.state.originDestinationAirport;
            }
        }
        if (selectedFlight.airline === undefined) {
            selectedFlight.airline = await airline.loadAirline(selectedFlight.airline_iata);
        }
        if (selectedFlight.plan === undefined) {
            selectedFlight.plan = await plan.loadFlightPlan(selectedFlight.departure_airport.icao_code, selectedFlight.arrival_airport.icao_code);
        }
        flight.state.selectedFlight = selectedFlight;
        flightInfoView.render(flight.state.selectedFlight);
    } catch (err) {
        console.log(err);
    }
};

const controlFlightTrack = async function (flightIata) {
    try {
        if (flightTrackIntervalID) clearInterval(flightTrackIntervalID);
        flightLiveView.render(flight.state.selectedFlight);
        flightTrackIntervalID = setInterval(() => {
            flight.updateFlightLocation(flightIata)
                .then(() => {
                    if (!flight.state.selectedFlight.live
                        || Object.keys(flight.state.selectedFlight.live).length === 0) {
                        clearInterval(flightTrackIntervalID);
                    }
                    flightLiveView.update(flight.state.selectedFlight);
                });
        }, FLIGHT_TRACK_UPDATE_INTERVAL_SEC);
    } catch (err) {
        console.log(err);
    }
}

const controlCancelFlightTracking = function () {
    clearInterval(flightTrackIntervalID);
};

const init = function () {
    searchView.addHandlerSearch(controlSearchResults);
    airportInfoView.addHandlerRender(controlAirports);
    arrivalsView.addHandlerRender(controlArrivals);
    arrivalsView.addHandlerSearch(controlArrivalsSearchResults);
    arrivalsView.addHandlerFlightSelected(controlFlight, controlFlightTrack);
    departuresView.addHandlerRender(controlDepartures);
    departuresView.addHandlerSearch(controlDeparturesSearchResults);
    departuresView.addHandlerFlightSelected(controlFlight, controlFlightTrack);
    flightInfoView.addHandlerCancelFlightTracking(controlCancelFlightTracking);
};

init();