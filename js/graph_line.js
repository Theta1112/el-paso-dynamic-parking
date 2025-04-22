import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

function initializeLineGraph(graphEl, data, eventBus) {

  // Clear existing graph
  graphEl.innerHTML = '';

  // Declare the chart dimensions and margins.
  const width = 350;
  const height = 120;
  const margin = {top: 30, right: 10, bottom: 20, left: 30}

  const parseDate = d3.timeParse("%Y-%m-%d");

  //console.log(districtData)

  data.forEach((e) =>{
    e.timestamp = parseDate("2024-" + e.month + "-" + e.day)
    return(e)
  }) 

  var districtData = data.filter((e) => e.cluster == 1 & e.month == 0)

  // Create the SVG container.
  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; max-height: 95%; height: auto; height: intrinsic;");

  // Declare the x (horizontal position) scale.
  const x = d3.scaleUtc()
    .range([margin.left, width - margin.right]) 

  // Add the x-axis.
  var xAxis = svg.append("g")
  .attr("transform", `translate(0,${height - margin.bottom})`)
  .call(d3.axisBottom(x).ticks(width / 40).tickSizeOuter(0));

  // Declare the y (vertical position) scale.
  const y = d3.scaleLinear([0, 1], [height - margin.bottom, margin.top]);

  // Add the y-axis, remove the domain line, add grid lines and a label.
  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(height / 40))
    .call(g => g.select(".domain").remove())
    .call(g => g.selectAll(".tick line").clone()
      .attr("x2", width - margin.left - margin.right)
      .attr("stroke-opacity", 0.1))
    .call(g => g.append("text")
      .attr("x", -margin.left)
      .attr("y", 10)
      .attr("fill", "currentColor")
      .attr("text-anchor", "start")
      .text("Occupied Fraction"));

  // Append a path for the line.
  // Add the line
  svg.append("path")
    .datum(districtData)
    .attr("fill", "none")
    .attr("stroke", "#004080")
    .attr("stroke-width", 2)
    .attr("d", d3.line()
    .x(d => x(d.timestamp))
    .y(d => y(d.occupancy))
  )

  graphEl.append(svg.node());

  function updateGraph(){

    // Adjust x domain to updated data
    x.domain(d3.extent(districtData, d => d.timestamp))

    //console.log(d3.max(data, d => d.qty))

    xAxis
      .transition()
      .duration(400)
      .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));

    var paths = svg.selectAll("path")
      .datum(districtData) 

      paths
      .enter()
      .append("path") // Add a new rect for each new elements
      .merge(paths) // get the already existing elements as well
      .transition()
      .duration(500)
      .attr("fill", "none")
      .attr("stroke", "#004080")
      .attr("stroke-width", 2)
      .attr("d", d3.line()
        .x(d => x(d.timestamp))
        .y(d => y(d.occupancy))
      )
      .delay(function(d,i){
        //console.log(i); 
        return(i*50)
      })
  }

  eventBus.addEventListener('filter-change', (e) => {
    
    const filterMonth = e.detail.month
    const filterCluster = e.detail.cluster == "all" ? 0 : e.detail.cluster 

    if (filterMonth == "all"){
      districtData = data.filter((row) => filterCluster == row.cluster)
    } else {
      districtData = data.filter((row) => filterMonth == row.month & filterCluster == row.cluster)
    }

    console.log(districtData)

    // Render the graph
    updateGraph()
  })
}

export { initializeLineGraph }