
// Create and add the street and meter layers to the map
function initializeStreets(map, meterData, streetData, eventBus) {

  // Generate Meter Layer
  var meterLayer = L.geoJSON(meterData, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, {
        radius: 2,
        fillColor: "blue",
        color: "black",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      });
    },
    onEachFeature: function (feature, layer) {
      if (feature.properties) {
        let popupContent = `
          <b>Location ID:</b> ${feature.properties.LocationID ?? 'N/A'} <br>
          <b>Street:</b> ${feature.properties.Street ?? 'N/A'} <br>
          <b>Total Revenue:</b> $${feature.properties.TotRev ?? 'N/A'}
        `;
        layer.bindPopup(popupContent);

        // Highlight effect on hover
        layer.on({
            mouseover: function (e) {
              var targetLayer = e.target;
              targetLayer.setStyle({
                fillColor: "yellow",
                color: "red",
                weight: 2
              });
            },
            mouseout: function (e) {
              meterLayer.resetStyle(e.target);
            }
        });
      }
    }
  }).addTo(map);

  // Function to control on click for each street
  function onEachStreet(feature, layer) {
    let props = feature.properties;

    let popupContent = `
      <b>Street Name:</b> ${props.STREETNAME ?? 'N/A'} ${props.STYPE ?? ''} <br>
      <b>Street ID:</b> ${props["street.ID"] ?? 'N/A'} <br>
      <b>Total Occupancy:</b> ${props.total_occupied ?? 'N/A'} <br>
      <b>Max Occupied:</b> ${props.max_occupied ?? 'N/A'} <br>
      <b>Estimated Capacity:</b> ${props["estimated.capacity"]?.toFixed(2) ?? 'N/A'} <br>
      <b>TOC:</b> ${props.toc ?? 'N/A'} <br>
    `;

    layer.bindPopup(popupContent);

    // Highlight effect on hover
    layer.on({
      mouseover: function (e) {
        var targetLayer = e.target;
        targetLayer.setStyle({
          color: 'purple',
          weight: 5
        });
      },
      mouseout: function (e) {
        streetLayer.resetStyle(e.target);
      },
      click: function (e) {
        map.fitBounds(e.target.getBounds());
      }
    });
  }

  // Generate Street layer 
  var streetLayer = L.geoJSON(streetData, {
    style: function (feature) {
      return {
        color: getColor(feature.properties["cluster"]),
        weight: 4,
        opacity: 0.8
      };
    },
    onEachFeature: onEachStreet }).addTo(map);

  // Adjust map view to the data  
  map.fitBounds(streetLayer.getBounds()); 

  // Pre-generate all cluster bounds
  // Get unique cluster identifiers
  const uniqueClusters = [...new Set(streetData.features.map((e) => e.properties.cluster))]

  const clusterBounds = uniqueClusters.map((cluster) => {
    //const clusterStreets = streetData
    //clusterStreets.features = streetData.features.filter((feature) => cluster == feature.properties["cluster"])
    //console.log(clusterStreets)
    //return(L.geoJSON(clusterStreets).getBounds())
  })
  //console.log(clusterBounds)
  
  eventBus.addEventListener('filter-change', (e) => {

    const districtStreets = { ...streetData }
    if (e.detail.cluster != "all"){
      districtStreets.features = streetData.features.filter((feature) => e.detail.cluster == feature.properties["cluster"])
    }

    // Remove old layer
    streetLayer.remove();

    // Create new layer
    streetLayer = L.geoJSON(districtStreets, {
      style: function (feature) {
        return {
          color: getColor(feature.properties["cluster"]),
          weight: 4,
          opacity: 0.8
        };
      },
      onEachFeature: onEachStreet }).addTo(map);
    
    //console.log(streetLayer.getLayers());

    map.fitBounds(streetLayer.getBounds())
  })
}

// Helper function to get color based on under.utilized status
function getColor(cluster) {

  const colors = ['#e41a1c',
  '#377eb8',
  '#4daf4a',
  '#984ea3',
  '#ff7f00',
  '#f781bf',
  '#a65628',
  '#999999'];

  return colors[parseInt(cluster)-1];
}

export { initializeStreets };
