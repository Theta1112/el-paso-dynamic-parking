// script.js
import { initializeFirstScreen } from './first_screen.js';
import { initializeMap } from './map_create.js';
import { loadDurationData, loadMeterData, loadOccupancyData, loadStreetData } from './data_load.js';
import { initializeStreets } from './street_create.js';
import { initializeSideSlider } from './slider.js';
import { initializeGraph } from './graph_hist.js';
import { initializeHeatmap } from './graph_heatmap.js';


// Event bus
const eventBus = new EventTarget(); 

// Initialize Background Map
var map = initializeMap(document.querySelector('#map'), eventBus);

// Load data
const meterData = await loadMeterData(eventBus);
const streetData = await loadStreetData(eventBus);
const durationData = await loadDurationData(eventBus);
const occupancyData = await loadOccupancyData(eventBus);


initializeFirstScreen();

// Render street and meter layers
initializeStreets(map, meterData, streetData, eventBus);
console.log(occupancyData)

initializeGraph(document.querySelector('#durationhist'), durationData, eventBus);
initializeHeatmap(document.querySelector('#occupancyheatmap', occupancyData, eventBus));
// Enable slider button
//initializeSideSlider(document.querySelector('.time-slider'), eventBus);
//initializeSideSlider(document.querySelector('.data-slider'), eventBus);