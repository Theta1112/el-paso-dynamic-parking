// script.js
import { initializeFirstScreen } from './first_screen.js';
import { initializeMap } from './map_create.js';
import { loadMeterData, loadStreetData } from './data_load.js';
import { initializeStreets } from './street_create.js';
import { initializeSideSlider } from './slider.js';


// Event bus
const eventBus = new EventTarget(); 

// Initialize Background Map
var map = initializeMap(document.querySelector('#map'), eventBus);

// Load data
const meterData = await loadMeterData(eventBus);
const streetData = await loadStreetData(eventBus);


initializeFirstScreen();

// Render street and meter layers
initializeStreets(map, meterData, streetData, eventBus);

// Enable slider button
initializeSideSlider(document.querySelector('.time-slider'), eventBus);
initializeSideSlider(document.querySelector('.data-slider'), eventBus);