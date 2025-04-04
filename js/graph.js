import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

function initializeGraph(graphEl, data, eventBus) {
  // renderGraph(graphEl, data);

  eventBus.addEventListener('street-clicked', (e) => {
    const filteredData = data.filter((row) => row.street_ID == e.detail.streetID);

    renderGraph(graphEl, filteredData);
  })
} 

function renderGraph(graphEl, data) {

  // Clear existing graph
  graphEl.innerHTML = '';

  // Declare the chart dimensions and margins.
  const width = 500;
  const height = 200;
  const marginTop = 25;
  const marginRight = 10;
  const marginBottom = 25;
  const marginLeft = 50;

  var parseDate = d3.timeParse("%Y-%m-%d-%H-%M");

  const cleanData = data.map( (d) => { 
    d.timestamp = parseDate(d.date + "-" + d.hour + "-" + d.minute);
    d.street_occupied = parseInt(d.street_occupied);
    d.occupied_fraction = parseFloat(d.occupied_fraction);
    return(d);
  } )

  // console.log(cleanData)

  // Declare the x (horizontal position) scale.
  const x = d3.scaleUtc(d3.extent(cleanData, d => d.timestamp), [marginLeft, width - marginRight]);

  // Declare the y (vertical position) scale.
  const y = d3.scaleLinear([0, d3.max(cleanData, d => d.occupied_fraction)], [height - marginBottom, marginTop]);

  // Create the SVG container.
  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; max-height: 95%; height: auto; height: intrinsic;");

  // Add the x-axis.
  svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));

  // Add the y-axis, remove the domain line, add grid lines and a label.
  svg.append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y).ticks(height / 40))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").clone()
          .attr("x2", width - marginLeft - marginRight)
          .attr("stroke-opacity", 0.1))
      .call(g => g.append("text")
          .attr("x", -marginLeft)
          .attr("y", 10)
          .attr("fill", "currentColor")
          .attr("text-anchor", "start")
          .text("Occupied Fraction"));

  // Append a path for the line.
  // Add the line
  svg.append("path")
    .datum(cleanData)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("d", d3.line()
    .x(d => x(d.timestamp))
    .y(d => y(d.occupied_fraction))
  )

  graphEl.append(svg.node());
}

export { initializeGraph }