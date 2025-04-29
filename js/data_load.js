
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
    obj.prediction = parseInt(obj.predicted)
    obj.month = parseInt(obj.month)
    obj.cluster = parseInt(obj.cluster)
  });

  return durationData;
}

// Load aggregated heatmap data
async function loadHeatmapData(eventBus) {

  const occupancyData = await readCSV('app_data/heatmap.csv')

  // Convert strings to integers
  occupancyData.forEach((obj) => {
    obj.occupancy = parseFloat(obj.ave_occupancy)
    obj.month = parseInt(obj.month)
    obj.cluster = parseInt(obj.cluster)
    obj.dotw = parseInt(obj.dotw)
  });

  //console.log(occupancyData)

  return occupancyData;
}

// Load aggregated heatmap data
async function loadLinegraphData(eventBus) {

  const occupancyData = await readCSV('app_data/linegraph.csv')

  // Convert strings to integers
  occupancyData.forEach((obj) => {
    obj.occupancy = parseFloat(obj.ave_occupancy)
    obj.month = parseInt(obj.month)
    obj.cluster = parseInt(obj.cluster)
    obj.predicted = parseFloat(obj.predicted)
  });

  //console.log(occupancyData)

  return occupancyData;
}

// Load cluster monthly data with month, year, cluster
async function loadMonthlyData(eventBus) {
  const data = await readCSV('app_data/cluster_monthly_data.csv');

  data.forEach(d => {
    d.cluster = parseInt(d.cluster);
    d.month = parseInt(d.month);
    d.year = parseInt(d.year);
    d.avg_occ = parseFloat(d.avg_occ);
    d.total_revenue = parseFloat(d.total_revenue);
    d.toc = parseFloat(d.toc);
    d.predicted_avg_occ = parseFloat(d.predicted_avg_occ);
    d.predicted_toc = parseFloat(d.predicted_toc);
    d.predicted_revenue = parseFloat(d.predicted_revenue);
  });

  return data;
}

// Load average occupancy by cluster
//
// async function loadAvgClusterOccupancy(eventBus) {
//   const clusterData = await readCSV('app_data/avg_occupancy_by_cluster.csv');
// 
//   // Convert to appropriate types
//   clusterData.forEach((obj) => {
//     obj.cluster = parseInt(obj.cluster);
//     obj.avg_occupancy = parseFloat(obj.avg_occupancy);
//   });
// 
//   return clusterData;
// }

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

export { loadMeterData, loadStreetData, loadDurationData, loadHeatmapData, loadLinegraphData, loadMonthlyData };


