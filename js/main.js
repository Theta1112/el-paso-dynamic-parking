// script.js
import { initializeMap } from './map_create.js';
import { loadMeterData, loadStreetData } from './data_load.js';
import { initializeStreets } from './street_create.js';
import { initializeSlider } from './slider.js';

// Event bus
const eventBus = new EventTarget(); 

// Initialize Background Map
var map = initializeMap(document.querySelector('#map'), eventBus);

// Load data
const meterData = await loadMeterData(eventBus);
const streetData = await loadStreetData(eventBus);

// Render street and meter layers
initializeStreets(map, meterData, streetData, eventBus);

// Enable slider button
initializeSlider(document.querySelector('time-slider'), eventBus);