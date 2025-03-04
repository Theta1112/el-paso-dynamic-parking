
// Load Meters data directly
async function loadMeterData(eventBus) {

  const response = await fetch('app_data/meters.geojson');

  const data = await response.json();
  
  if (!data || isEmpty(data)) {
    console.error('Empty or invalid GeoJSON for parking_meters.geojson');
    return(null);
  } else {
    return(data)
  }
}

// Load Streets data directly
async function loadStreetData(eventBus) {

  const response = await fetch('app_data/nov_completed.geojson');

  const data = await response.json();
  
  if (!data || isEmpty(data)) {
    console.error('Empty or invalid GeoJSON for nov_completed.geojson');
    return(null);
  } else {
    return(data)
  }
}

// Helper function to check if an object is empty
function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

export { loadMeterData, loadStreetData };
