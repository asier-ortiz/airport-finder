'use strict';

import {TIMEOUT_SEC} from "./config.js";

const timeout = function (seconds) {
    return new Promise(function (_, reject) {
        setTimeout(function () {
            reject(new Error(`Request timeout after ${seconds} second(s)`));
        }, seconds);
    });
};

export const AJAX = async function (url, cache = true, signal) {
    try {
        const headers = new Headers();
        headers.append('Accept', 'application/json');

        const init = {
            method: 'GET',
            cache: cache ? 'force-cache' : 'no-store',
            signal: signal,
            headers: headers,
        }

        const fetchPro = fetch(url, init);
        const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
        const data = await res.json();
        if (!res.ok) throw new Error(`${{status: res.status, message: data.message}}`);
        return data;
    } catch (e) {
        throw e;
    }
};

///////////////////////////////////////////////////////////////////////////////////

export const formatDateToISO = function (date) {
    return date.toISOString().split('T')[0];
};

export const formatDateToTime = function (date) {
    return new Date(date).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });
}

export const getUserTz = function () {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
}

export const convertFeetToMeters = function (feet) {
    return ~~(Math.round(10_000 * (feet / 3.281)) / 10_000);
}

export const convertMinutesToHoursAndMinutes = function (duration) {
    if (duration < 60) return `${duration} min`;
    let hours = (duration / 60);
    let rhours = Math.floor(hours);
    let minutes = (hours - rhours) * 60;
    let rminutes = Math.round(minutes);
    if (rminutes > 0) {
        return `${rhours} hora(s) y ${rminutes} minuto(s)`;
    } else {
        return `${rhours} hora(s)`;
    }
}

export const calcDiffInMinutesFromUTCNow = function (date) {
    if (!date) return 1000;
    const utcNow = new Date().toUTCString();
    const dateUtc = new Date(date).toUTCString();
    const diff = Math.abs(new Date(utcNow) - new Date(dateUtc));
    const minutes = Math.floor((diff / 1000) / 60);
    return minutes;
}

const calcDistance = function (lat1, lon1, lat2, lon2, unit) {
    if ((lat1 === lat2) && (lon1 === lon2)) return 0;
    else {
        const radlat1 = Math.PI * lat1 / 180;
        const radlat2 = Math.PI * lat2 / 180;
        const theta = lon1 - lon2;
        const radtheta = Math.PI * theta / 180;
        let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) dist = 1;
        dist = Math.acos(dist);
        dist = dist * 180 / Math.PI;
        dist = dist * 60 * 1.1515;
        if (unit === "K") dist = dist * 1.609344
        if (unit === "N") dist = dist * 0.8684
        return dist;
    }
}

export const calcFlightPathTraveledPercentage = function (depLat, depLng, arrLat, arrLng, aircraftLat, aircraftLng) {
    if (isNaN(depLat) || isNaN(depLng) || isNaN(arrLat) || isNaN(arrLng) || isNaN(aircraftLat) || isNaN(aircraftLng)) return 0;
    const pathTotalDistanceKM = calcDistance(depLat, depLng, arrLat, arrLng, "K");
    const aircraftDistanceTraveledKM = calcDistance(depLat, depLng, aircraftLat, aircraftLng, "K");
    const percentage = ((100 * aircraftDistanceTraveledKM) / pathTotalDistanceKM).toFixed(2);
    return percentage > 100 ? 100 : percentage;
}

export const stripString = function (string) {
    return string.replace(/\s+/g, '').toLowerCase();
};

export const highlightSearchMatches = function (term, results) {
    return results.replace(new RegExp(term, "gi"), (match) => `<mark>${match}</mark>`);
};

export const sortFlightsByDepartureTime = function (arr) {
    arr.sort((a, b) => new Date(a.dep_time_utc) - new Date(b.dep_time_utc));
    return arr;
};

export const removeDuplicates = function (data) {
    return [...new Set(data.map((obj) => JSON.stringify(obj)))]
        .map((objString) => JSON.parse(objString));
}