'use strict';

import {AIRLABS_API_URL, AIRLABS_KEY} from "../config.js";
import {AJAX} from "../helpers.js";

export const loadCity = async function (cityCode) {
    try {
        let data = await AJAX(`${AIRLABS_API_URL}cities?api_key=${AIRLABS_KEY}&city_code=${cityCode}&lang=es`);
        return data.response[0];
    } catch (err) {
        console.log(`${err.status} - ${err.message}`);
        throw err;
    }
}