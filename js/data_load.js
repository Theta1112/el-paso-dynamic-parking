
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

  const response = await fetch('app_data/clustered.geojson');

  const data = await response.json();
  
  if (!data || isEmpty(data)) {
    console.error('Empty or invalid GeoJSON for nov_completed.geojson');
    return(null);
  } else {
    return(data)
  }
}

// Load duration data
async function loadDurationData(eventBus) {

  const durationData = await readCSV('app_data/duration_hist.csv')

  // Convert strings to integers
  durationData.forEach((obj) => {
    obj.bucket = parseInt(obj.bucket)
    obj.qty = parseInt(obj.qty)
  });

  return durationData;
}

// Load historical data
async function loadHistoryData(eventBus) {

  const historyData = await readCSV('app_data/jan_data.csv');
  
  return historyData;
}

// Load aggregated occupancy data
async function loadOccupancyData(eventBus) {

  const occupancyData = await readCSV('app_data/average_occupancy.csv')

  // Convert strings to integers
  occupancyData.forEach((obj) => {
    obj.occupancy = parseFloat(obj.occupancy)
    obj.dotw = parseInt(obj.dotw)
  });

  //console.log(occupancyData)

  return occupancyData;
}

// Helper function to check if an object is empty
function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

// sourced from https://hasnode.byrayray.dev/convert-a-csv-to-a-javascript-array-of-objects-the-practical-guide
async function readCSV(path) { 
  const response = await fetch(path);

  const responseText = await response.text();

  const [rawKeys, ...rest] = responseText
      .trim()
      .split("\n")
      .map((item) => item.split(","));

  const keys = rawKeys.map((key) => key.replaceAll('\"', "").replaceAll('\r', ""));

  //console.log(keys);

  const formedArr = rest.map((item) => {
      const object = {};
      
      keys.forEach((key, index) => (object[key] = item
        .at(index)
        .replaceAll('\r', "")
        .replaceAll('"', "")
        .replaceAll("'", "")));
      
      return object;
    });
  
  return(formedArr)
}

export { loadMeterData, loadStreetData, loadDurationData, loadOccupancyData, loadHistoryData };
