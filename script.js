import countriesBorders from "./countriesBorders.js";
import countriesCodes from "./countriesCodes.js";
import countriesInfo from "./countriesInfo.js";

//COUNTRY HIGHLIGHTNING SETTINGS
const GEO_COUNTRY_WEIGHT = 3;
const GEO_COUNTRY_OPACITY = 0.5;

//MAP DISPLAY SETTINGS
const GE0_MAP_COLOR = "lightgreen";
const GE0_MAP_WEIGHT = 4;
const GE0_MAP_OPACITY = 0.5;
const GEO_MAP_CENTER = [52.23, 21.22];
const GEO_MAP_ZOOM = 5;
const GEO_MAP_MIN_ZOOM = 5;

//CREATE A WORLD MAP
const myMap = L.map('mapid', {
    minZoom: GEO_MAP_MIN_ZOOM
}).setView(GEO_MAP_CENTER, GEO_MAP_ZOOM);

const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const tiles = L.tileLayer(tileUrl, {attribution});
tiles.addTo(myMap);

const mapStyle = {
    "color": GE0_MAP_COLOR,
    "weight": GE0_MAP_WEIGHT,
    "opacity": GE0_MAP_OPACITY
};

const mapBorders = L.geoJSON(countriesBorders, {style: mapStyle});

const mapLayers = L.layerGroup([mapBorders]);
mapLayers.addTo(myMap);

//HANDLE CLICK ON A COUNTRY
const handleClick = (event) => {
    //READ CO-ORDINATES
    const lat = Math.round(event.latlng.lat*100)/100;
    const lng = Math.round(event.latlng.lng*100)/100;

    //"GEONAMES API" REQUEST - GET COUNTRY ISO CODE
    const URL = `https://secure.geonames.org/countryCode?lat=${lat}&lng=${lng}&username=barkow96`;
    const http = new XMLHttpRequest();
    http.open("GET", URL);
    http.send();
    
    http.onreadystatechange = (e) => {
        const countryCode = http.responseText.slice(0,2);
        const country = decipherCountry(countryCode);

        const geoStyle = {
            "color": "",
            "weight": GEO_COUNTRY_WEIGHT,
            "opacity": GEO_COUNTRY_OPACITY
        };
        const geoCountry = {
            "type": "FeatureCollection",
            "features": []
        };

        let marker;
        for (const record of countriesInfo.data) {
            if (record.country === country) {
                const others = record.others;
                for (const other of others) {
                    for (const land of countriesBorders.features) {
                        if (land.properties.name === other.code) {
                            geoCountry.features[0] = land;
                            geoStyle.color = other.color;

                            marker = L.geoJSON(geoCountry, {style: geoStyle});
                            mapLayers.addLayer(marker);
                        };
                    };
                };
                break;
            };
        
        mapLayers.clearLayers();
        mapLayers.addLayer(mapBorders);
        mapLayers.addTo(myMap);
    };
    };
};

//FUNCTION THAT RETURNS COUNTRY NAME ON THE BASIS OF ITS ISO CODE
const decipherCountry = (countryCode) => {
    for (const code in countriesCodes) if (countryCode == code) return countriesCodes[code];
};

//EVENT LISTENER FOR CLICKING ON THE MAP
myMap.addEventListener("click", (event) => handleClick(event));
