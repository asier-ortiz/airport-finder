'use strict';

import {OPENWEATHER_API_URL, OPENWEATHER_KEY} from "../config.js";
import {AJAX} from "../helpers.js";

export const loadAirportWeather = async function (lat, lng) {
    try {
        return await AJAX(`${OPENWEATHER_API_URL}weather?appid=${OPENWEATHER_KEY}&lat=${lat}&lon=${lng}&units=metric`);
    } catch (err) {
        console.log(`${err.status} - ${err.message}`);
        throw err;
    }
}