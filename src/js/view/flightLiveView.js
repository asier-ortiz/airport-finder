'use strict';

import icons from 'url:../../img/icons.svg';
import {MAPBOX_KEY} from "../config.js";
import L, {Icon} from "leaflet";
import defaultIconUrl from "leaflet/dist/images/marker-icon.png";
import defaultIconShadowUrl from "leaflet/dist/images/marker-shadow.png";
import aircraftIconUrl from "../../img/aircraft.png";
import 'leaflet-rotatedmarker';
import 'polyline-encoded';
import {calcFlightPathTraveledPercentage} from "../helpers.js";

const defaultIcon = L.icon({
    iconSize: [25, 41],
    iconAnchor: [10, 41],
    popupAnchor: [2, -40],
    iconUrl: defaultIconUrl,
    shadowUrl: defaultIconShadowUrl
});

const aircraftIcon = new Icon({
    iconSize: [30, 30],
    iconAnchor: [10, 41],
    popupAnchor: [2, -40],
    iconUrl: aircraftIconUrl,
});

let flightMaker;
let map;

class FlightLiveView {
    #data;
    #parentElement = document.querySelector('.airport');

    _clear() {
         if (map !== undefined && flightMaker !== undefined)
            map.removeLayer(flightMaker);
        
        const section = document.querySelector('.flight-live');
        if (typeof (section) != 'undefined' && section != null) {
            section.parentElement.removeChild(section);
            flightMaker = undefined;
        }
    };

    static #generateMarkup() {
        return `
        <div class="flight-live__map" id="map"></div>
        <div class="flight-live__data">
            <div class="flight-live-data-item">
                <span class="flight-live-data-item__title">Altitud</span>
                <svg class="flight-live-data-item__icon flight-live-data-item__icon--altitude">
                    <use xlink:href="${icons}#altitude"></use>
                </svg>
                <span class="flight-live-data-item__data flight-live-data-item__data--altitude">0 M</span>
            </div>
            <div class="flight-live-data-item">
                <span class="flight-live-data-item__title">Vel. Horizontal</span>
                <svg class="flight-live-data-item__icon flight-live-data-item__icon--speed-horizontal">
                    <use xlink:href="${icons}#speed_horizontal"></use>
                </svg>
                <span class="flight-live-data-item__data flight-live-data-item__data--speed-horizontal">0 KM/H</span>
            </div>
            <div class="flight-live-data-item">
                <span class="flight-live-data-item__title">Vel. Vertical</span>
                <svg class="flight-live-data-item__icon flight-live-data-item__icon--speed-vertical">
                    <use xlink:href="${icons}#speed_vertical"></use>
                </svg>
                <span class="flight-live-data-item__data flight-live-data-item__data--speed-vertical">0 KM/H</span>
            </div>
            <div class="flight-live-data-item">
                <span class="flight-live-data-item__title">Trayecto</span>
                <div class="circle-wrap">
                    <div class="circle">
                        <div class="mask full">
                            <div class="fill"></div>
                        </div>
                        <div class="mask half">
                            <div class="fill"></div>
                        </div>
                        <div class="inside-circle">0 %</div>
                    </div>
                </div>
            </div>
        </div>
        `
    };

    #generateMap = function (departureAirport, arrivalAirport, encodedPolyline) {

        map = L.map("map", {zoomControl: false, attributionControl: false});
        const bounds = new L.LatLngBounds([departureAirport.lat, departureAirport.lng], [arrivalAirport.lat, arrivalAirport.lng]);
        map.fitBounds(bounds)

        if (encodedPolyline){
            const decodedPolyLine = L.Polyline.fromEncoded(encodedPolyline);
            const polyline = new L.Polyline(decodedPolyLine.getLatLngs(), {
                color: 'red',
                weight: 3,
                opacity: 0.5,
                smoothFactor: 1
            });
            polyline.addTo(map);
        }

        L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
            {
                minZoom: 0,
                maxZoom: 10,
                id: "mapbox/streets-v11",
                accessToken: `${MAPBOX_KEY}`
            }).addTo(map);

        L.marker([departureAirport.lat, departureAirport.lng], {icon: defaultIcon})
            .bindPopup(`
                <div class="popup">
                    <p>${departureAirport.names?.es ?? departureAirport.name ?? '--'}</p>
                    <p>${departureAirport.city?.names?.es ?? departureAirport.city?.name ?? '--'}, ${departureAirport.country?.names?.es ?? departureAirport.country?.name ?? '--'}</p>
                    <p><i>Iata:</i> ${departureAirport.iata_code ?? '--'}</p>
                    <p><i>Lat:</i> ${departureAirport.lat ?? '--'}</p>
                    <p><i>Lng:</i> ${departureAirport.lng ?? '--'}</p>
                </div>`)
            .addTo(map);

        L.marker([arrivalAirport.lat, arrivalAirport.lng], {icon: defaultIcon})
            .bindPopup(`
                <div class="popup">
                    <p>${arrivalAirport.names?.es ?? arrivalAirport.name ?? '--'}</p>
                    <p>${arrivalAirport.city?.names?.es ?? arrivalAirport.city?.name ?? '--'}, ${arrivalAirport.country?.names?.es ?? arrivalAirport.country?.name ?? '--'}</p>
                    <p><i>Iata:</i> ${arrivalAirport.iata_code ?? '--'}</p>
                    <p><i>Lat:</i> ${arrivalAirport.lat ?? '--'}</p>
                    <p><i>Lng:</i> ${arrivalAirport.lng ?? '--'}</p>
                </div>`)
            .addTo(map);

        L.control.zoom({position: 'topright'}).addTo(map);
    }

    render(data) {
        if (!data || Object.keys(data).length === 0) return;
        this.#data = data;
        const markup = FlightLiveView.#generateMarkup();
        this._clear();
        const section = document.createElement("section");
        section.classList.add("flight-live");
        section.insertAdjacentHTML('beforeend', markup);
        this.#parentElement.appendChild(section);
        this.#generateMap(this.#data.departure_airport, this.#data.arrival_airport, this.#data.plan.encodedPolyline);
    }

    update(data) {
        if (!data.live || Object.keys(data.live).length === 0) return;
        this.#data = data;
        const altitudeEl = document.querySelector(".flight-live-data-item__data--altitude");
        const speedHorizontalEl = document.querySelector(".flight-live-data-item__data--speed-horizontal");
        const speedVerticalEl = document.querySelector(".flight-live-data-item__data--speed-vertical");

        altitudeEl.textContent = `${this.#data.live.alt} M`;
        speedHorizontalEl.textContent = `${this.#data.live.speed} KM/H`;
        speedVerticalEl.textContent = `${this.#data.live.v_speed} KM/H`;
        const heading = this.#data.live.dir;

        const traveledPercentage = calcFlightPathTraveledPercentage(
            this.#data.departure_airport.lat, this.#data.departure_airport.lng,
            this.#data.arrival_airport.lat, this.#data.arrival_airport.lng,
            this.#data.live.lat, this.#data.live.lng
        );
        const percentageEl = document.querySelector('.inside-circle');
        percentageEl.innerHTML = `${traveledPercentage}%`;
        const circleElements =
            [
                document.querySelector('.full'),
                ...document.querySelectorAll('.fill')
            ];
        const rotationDegrees = ~~((~~traveledPercentage * 180) / 100);
        circleElements.forEach(el => el.style.transform = `rotate(${rotationDegrees}deg)`);

        if (!flightMaker) {
            flightMaker =
                L.marker([this.#data.live.lat, this.#data.live.lng], {icon: aircraftIcon, rotationAngle: heading})
                    .bindPopup(`
                    <div class="popup">
                        <p>${this.#data.live.flight_iata ?? '--'}</p>
                        <p><i>Modelo:</i> ${this.#data.live.aircraft_icao ?? '--'}</p>
                        <p><i>Lat:</i> ${this.#data.live.lat ?? '--'}</p>
                        <p><i>Lng:</i> ${this.#data.live.lng ?? '--'}</p>
                    </div>
                `).addTo(map);
        } else {
            flightMaker.setLatLng([this.#data.live.lat, this.#data.live.lng]);
            flightMaker.setPopupContent(`
                <div class="popup">
                    <p>${this.#data.flight_iata ?? '--'}</p>
                    <p><i>Modelo:</i> ${this.#data.live.aircraft_icao ?? '--'}</p>
                    <p><i>Lat:</i> ${this.#data.live.lat ?? '--'}</p>
                    <p><i>Lng:</i> ${this.#data.live.lng ?? '--'}</p>
                </div>
            `)
            flightMaker.rotationAngle = heading;
        }
    }
}

export default new FlightLiveView();
