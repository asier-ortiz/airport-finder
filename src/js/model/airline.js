'use strict';

import {AIRLABS_API_URL, AIRLABS_KEY} from "../config.js";
import {AJAX} from "../helpers.js";

export const loadAirline = async function (airlineIataCode) {
    try {
        let data = await AJAX(`${AIRLABS_API_URL}airlines?api_key=${AIRLABS_KEY}&iata_code=${airlineIataCode}&lang=es`);
        return data.response[0];
    } catch (err) {
        console.log(`${err.status} - ${err.message}`);
        throw err;
    }
}