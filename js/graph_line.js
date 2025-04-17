import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

function initializeLineGraph(graphEl, data, eventBus) {
  renderGraph(graphEl, data);

  //eventBus.addEventListener('street-clicked', (e) => {
  //  const filteredData = data.filter((row) => row.street_ID == e.detail.streetID);

  //  renderGraph(graphEl, filteredData);
  //})
} 

function renderGraph(graphEl, data) {

  // Clear existing graph
  graphEl.innerHTML = '';

  // Declare the chart dimensions and margins.
  const width = 350;
  const height = 120;
  const margin = {top: 10, right: 10, bottom: 20, left: 30}

  const parseDate = d3.timeParse("%Y-%m-%d");

  const districtData = data.filter((e) => e.cluster == 1 & e.month == 1)

  districtData.forEach((e) =>{
    e.timestamp = parseDate("2024-" + e.month + "-" + e.day)
    return(e)
  }) 

  console.log(districtData)

  // Declare the x (horizontal position) scale.
  const x = d3.scaleUtc(d3.extent(districtData, d => d.timestamp), [margin.left, width - margin.right]);

  // Declare the y (vertical position) scale.
  const y = d3.scaleLinear([0, d3.max(districtData, d => d.occupancy)], [height - margin.bottom, margin.top]);

  // Create the SVG container.
  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; max-height: 95%; height: auto; height: intrinsic;");

  // Add the x-axis.
  svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));

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
}

export { initializeLineGraph }