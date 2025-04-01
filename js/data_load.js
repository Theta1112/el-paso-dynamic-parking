
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

// Load historical data
// sourced from https://hasnode.byrayray.dev/convert-a-csv-to-a-javascript-array-of-objects-the-practical-guide
async function loadHistoryData(eventBus) {

  const response = await fetch('app_data/jan_data.csv');

  const responseText = await response.text();

  const [rawKeys, ...rest] = responseText
      .trim()
      .split("\n")
      .map((item) => item.split(","));

  const keys = rawKeys.map((key) => key.replaceAll('\"', "").replaceAll('\r', ""));

  console.log(keys);

  const formedArr = rest.map((item) => {
      const object = {};
      keys.forEach((key, index) => (object[key] = item.at(index)));
      return object;
    });
  
  return formedArr;
}

// Helper function to check if an object is empty
function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

export { loadMeterData, loadStreetData, loadHistoryData };
