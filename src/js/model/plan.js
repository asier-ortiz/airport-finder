'use strict';

import {FLIGTHPLANS_API_URL} from "../config.js";
import {AJAX} from "../helpers.js";

export const loadFlightPlan = async function (fromIcao, toIcao) {
    try {
        let data = await AJAX(`${FLIGTHPLANS_API_URL}search/plans?fromICAO=${fromIcao}&toICAO=${toIcao}`);
        return data.reduce(function (p1, p2) {
            return (p1.popularity > p2.popularity ? p1 : p2);
        });
    } catch (err) {
        console.log(`${err.status} - ${err.message}`);
        throw err;
    }
}