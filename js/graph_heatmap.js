import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

function initializeHeatmap(graphEl, data, eventBus) {
  //console.log(data);
  renderGraph(graphEl, data, eventBus);
} 

function renderGraph(graphEl, data, eventBus) {

  const districtData = data.filter((e) => e.cluster == 1 & e.month == 1) 

  console.log(districtData)

  const margin = {top: 10, right: 30, bottom: 10, left: 40}
  const width = 350 - margin.left - margin.right
  const height = 140;

  // append the svg object to the body of the page
  var svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; max-height: 95%; height: auto; height: intrinsic;");

  // Labels of row and columns -> unique identifier of the column called 'group' and 'variable'
  const myGroups = Array.from(new Set(districtData.map(d => d.dotw)))
  const myVars = Array.from(new Set(districtData.map(d => d.tod)))

  // Build X scales and axis:
  const x = d3.scaleBand()
    .range([ 0, width ])
    .domain(myGroups)
    .padding(0.05);
  svg.append("g")
    .style("font-size", 15)
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).tickSize(0))
    .select(".domain").remove()

  // Build Y scales and axis:
  const y = d3.scaleBand()
    .range([ height, margin.top ])
    .domain(myVars)
    .padding(0.05);
  svg.append("g")
    .style("font-size", 15)
    .call(d3.axisLeft(y).tickSize(0))
    .select(".domain").remove()

  // Build color scale
  const myColor = d3.scaleSequential()
    .interpolator(d3.interpolateRgb("#004080", "#FF8C00"))
    .domain([0,1])

  // create a tooltip
  const tooltip = d3.select(graphEl)
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")

  // Three function that change the tooltip when user hover / move / leave a cell
  const mouseover = function(event,d) {

    tooltip
      .style("opacity", 1)
    d3.select(this)
      .style("stroke", "black")
      .style("opacity", 1)
  }

  const hover = {x: 300, y: 300}

  const mousemove = function(event,d) {

    if (event.x > 410) {
      hover.x = event.x - 100
    } else {
      hover.x = event.x
    }
    
    hover.y = event.y
    //else {
    //  hover.x = event.x
    //}

    //if (event.y < 300) {
      //hover.y = event.y -20
    //}

    tooltip
        .html(d.dotw_string + " " + d.tod + "<br>" + "Occupancy: " + Math.round(d.occupancy * 100) + "%" )
        .style("font-size", "10px")
        .style("left", hover.x + "px")
        .style("top", hover.y + "px")
        .style("opacity", 1)

    //console.log("x: " + event.x + " y: " + event.y)

    
  }
  const mouseleave = function(event,d) {
    tooltip
      .style("opacity", 0)
    d3.select(this)
      .style("stroke", "none")
      .style("opacity", 0.8)
  }

  // add the squares
  svg.selectAll()
    .data(districtData, function(d) {return d.dotw+':'+d.tod;})
    .join("rect")
      .attr("x", function(d) { return x(d.dotw) })
      .attr("y", function(d) { return y(d.tod) })
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("width", x.bandwidth() )
      .attr("height", y.bandwidth() )
      .style("fill", function(d) { return myColor(d.occupancy)} )
      .style("stroke-width", 4)
      .style("stroke", "none")
      .style("opacity", 0.8)
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave);

  graphEl.append(svg.node());

}

export { initializeHeatmap }