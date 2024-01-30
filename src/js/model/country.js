'use strict';

import {AIRLABS_API_URL, AIRLABS_KEY} from "../config.js";
import {AJAX} from "../helpers.js";

export const loadCountry = async function (countryCode) {
    try {
        let data = await AJAX(`${AIRLABS_API_URL}countries?api_key=${AIRLABS_KEY}&code=${countryCode}&lang=es`);
        return data.response[0];
    } catch (err) {
        console.log(`${err.status} - ${err.message}`);
        throw err;
    }
}