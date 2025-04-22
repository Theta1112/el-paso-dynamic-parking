// script.js
import { initializeFirstScreen } from './first_screen.js';
import { initializeMap } from './map_create.js';
import { loadDurationData, loadMeterData, loadHeatmapData, loadStreetData, loadLinegraphData, loadMonthlyData } from './data_load.js';
import { initializeStreets } from './street_create.js';
import { initializeSideSlider } from './slider.js';
import { initializeHistogram } from './graph_hist.js';
import { initializeHeatmap } from './graph_heatmap.js';
import { initializeSummaryLogic } from './summary_logic.js';
import { initializeDistrictSelector } from './district_select.js';
import { initializeLineGraph } from './graph_line.js';
import { initializeToggleMode } from './toggle_mode.js';

// Event bus
const eventBus = new EventTarget(); 

// Initialize Background Map
const { map, lightTile, darkTile } = initializeMap(document.querySelector('#map'), eventBus);

// Load data
const meterData = await loadMeterData(eventBus);
const streetData = await loadStreetData(eventBus);
const durationData = await loadDurationData(eventBus);
const heatmapData = await loadHeatmapData(eventBus);
const linegraphData = await loadLinegraphData(eventBus);
const monthlyData = await loadMonthlyData(eventBus);

//initializeFirstScreen();

// Render street and meter layers
initializeStreets(map, meterData, streetData, eventBus);


initializeHistogram(document.querySelector('#durationhist'), durationData, eventBus);
initializeHeatmap(document.querySelector('#occupancyheatmap'), heatmapData, eventBus);
initializeLineGraph(document.querySelector('#linegraph'), linegraphData, eventBus);

// District Selector
// initializeDistrictSelector(eventBus, avgClusterOccupancyData);

// Summary Logic
initializeSummaryLogic(eventBus, monthlyData);

// Add dropdown listener to trigger the cluster change
// const districtDropdown = document.querySelector('#district-select');
// districtDropdown.addEventListener('change', (e) => {
//   const selectedValue = e.target.value;
// 
//   eventBus.dispatchEvent(new CustomEvent('district-filter-changed', {
//     detail: {
//       cluster: selectedValue === 'all' ? 'all' : parseInt(selectedValue)
//     }
//   }));
// });

// Enable slider button
//initializeSideSlider(document.querySelector('.time-slider'), eventBus);
//initializeSideSlider(document.querySelector('.data-slider'), eventBus);

// Toggle Mode
initializeToggleMode(map, lightTile, darkTile, eventBus);