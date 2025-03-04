// script.js
import { initializeMap } from "./map_create.js";
import { loadMeterData, loadStreetData } from "./data_load.js";
import { initializeStreets } from "./street_create.js";

// Event bus
const eventBus = new EventTarget(); 

// Initialize Background Map
var map = initializeMap(document.querySelector('map'), eventBus);

// Load data
meterData = await loadMeterData(eventBus);
streetData = await loadStreetData(eventBus);

// Render street and meter layers
initializeStreets(map, meterData, streetData, eventBus);
