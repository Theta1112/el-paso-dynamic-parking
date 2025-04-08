
// Create and add the street and meter layers to the map
function initializeStreets(map, meterData, streetData, eventBus) {

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
        /**let popupContent = `
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
        });*/
      }
    }
  }).addTo(map);

  var streetLayer = L.geoJSON(streetData, {
    style: function (feature) {
      return {
        color: getColor(feature.properties["cluster"]),
        weight: 4,
        opacity: 0.8
      };
    },
      /** onEachFeature: function (feature, layer) {
        let props = feature.properties;
        let utilizationStatus = props["under.utilized"] ? "Under Utilized" : "Optimally Utilized";

        let popupContent = `
          <b>Street Name:</b> ${props.STREETNAME ?? 'N/A'} ${props.STYPE ?? ''} <br>
          <b>Street ID:</b> ${props["street.ID"] ?? 'N/A'} <br>
          <b>Total Occupancy:</b> ${props.total_occupied ?? 'N/A'} <br>
          <b>Max Occupied:</b> ${props.max_occupied ?? 'N/A'} <br>
          <b>Estimated Capacity:</b> ${props["estimated.capacity"]?.toFixed(2) ?? 'N/A'} <br>
          <b>TOC:</b> ${props.toc ?? 'N/A'} <br>
          <span class="utilization-status">${utilizationStatus}</span>
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
      }*/
  }).addTo(map);

  map.fitBounds(streetLayer.getBounds()); // Adjust map view to the data
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
