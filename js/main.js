// script.js
import { initializeFirstScreen } from './first_screen.js';
import { initializeMap } from './map_create.js';
import { loadMeterData, loadStreetData, loadHistoryData, loadDurationData, loadOccupancyData } from './data_load.js';
import { initializeStreets } from './street_create.js';
import { initializeSideSlider, initializeGraphSlider } from './slider.js';
import { initializeGraph } from './graph_heatmap.js';


// Event bus
const eventBus = new EventTarget(); 

// Initialize Start up screen
// initializeFirstScreen();

// Initialize Background Map
var map = initializeMap(document.querySelector('#map'), eventBus);

// Load data
const meterData = await loadMeterData(eventBus);
const streetData = await loadStreetData(eventBus);
const historyData = await loadHistoryData(eventBus);
const durationData = await loadDurationData(eventBus);
const occupancyData = await loadOccupancyData(eventBus);


// Render street and meter layers
initializeStreets(map, meterData, streetData, eventBus);

// Enable side slider buttons
initializeSideSlider(document.querySelector('.time-slider'), eventBus);
initializeSideSlider(document.querySelector('.data-slider'), eventBus);

// Enable graph slide button
initializeGraphSlider(document.querySelector('.graph-slider'), eventBus);

// Initialize graph
initializeGraph(document.querySelector('.graph'), occupancyData, eventBus)