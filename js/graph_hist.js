import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

function initializeHistogram(graphEl, data, eventBus) {

  console.log(data)
  //renderGraph(graphEl, data, eventBus);

  eventBus.addEventListener('filter-change', (e) => {
    const filteredData = data.filter((row) => {

      //console.log(e)
      return(
        (e.detail.month == "all" || e.detail.month == row.month)
        & (e.detail.cluster == "all" || e.detail.month == row.cluster)
      )
    })

    //console.log(data)

    renderGraph(graphEl, filteredData, eventBus);
  })
} 

function renderGraph(graphEl, rawData, eventBus) {

  const margin = {top: 10, right: 10, bottom: 25, left: 20}
  const width = 300 - margin.left - margin.right
  const height = 200;
  const xAxisLabelHeight = 20;
  const yAxisLabelHeight = 20;

  // height that the bars float above the x axis
  const floatHeight = 1;

  // Compute graph size
  const graphHeight = height - xAxisLabelHeight - yAxisLabelHeight - margin.bottom - margin.top - floatHeight;
  const graphBottom = yAxisLabelHeight + graphHeight + margin.top;


  // Represent quantities in 1000s
  rawData.map((d) => {d.qty = Math.floor(d.qty / 1000)})
  
  const data = rawData.slice(0,-1)

  const cumSum = (sum => value => sum += value)(0);

  const dataCumulative = rawData.map(d => d.qty).map(cumSum)

  const dataPercentage = dataCumulative.map(d => Math.round(d / Math.max(...dataCumulative) * 1000) / 10)

  // append the svg object to the body of the page
  var svg = d3.create("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("viewBox", [0, 0, width, height])
  .attr("style", "max-width: 100%; max-height: 95%; height: auto; height: intrinsic;");

  // X axis
  var x = d3.scaleLinear([0, 240], [margin.left, width - margin.right]);

  svg.append("g")
    .attr("transform", `translate(0,${graphBottom + floatHeight})`)
    .call(d3.axisBottom(x).tickValues([30,60,90,120,150,180,210,240]).tickSizeOuter(0));

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.qty)])
    .range([ graphBottom, graphBottom - graphHeight]);

  svg.append("g")
    .attr("transform", `translate(${margin.left - 5},0)`)
    .call(d3.axisLeft(y).tickValues([100,200,300,400,500]).tickSizeOuter(0));

  // Bars
  svg.selectAll("mybar")
    .data(data)
    .enter()
    .append("rect")
      .attr("x", function(d) { return x(d.bucket) ; })
      .attr("width", 12)
      .attr("fill", "#004080")
      .attr("bucket", function(d) { return d.bucket ; })
      // no bar at the beginning thus:
      .attr("height", function(d) { return graphBottom - y(0); }) // always equal to 0
      .attr("y", function(d) { return y(0); })
      .on('mouseover', function (d, i) {
        
        // Dispatch event when bar is hovered over
        //console.log(this.getAttribute('bucket'))
        const barHovered = new CustomEvent('bar-hover', { detail: { bucket: this.getAttribute('bucket') }});
        eventBus.dispatchEvent(barHovered); })

      .on('mouseout', function (d, i) {
        
        // Dispatch coresponding even when bar is hovered off
        const barHoveredOff = new CustomEvent('bar-hover-off');
        eventBus.dispatchEvent(barHoveredOff); })

  // x-axis label
  svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "middle")
    .attr("x", width / 2 + 10)
    .attr("y", graphBottom + 30 ) // Modify with tick size
    .attr("font-size", 12)
    .text("Parking Duration (Minutes)");

  // y-axis label
  svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "left")
    .attr("x", 8)
    .attr("y", yAxisLabelHeight - 3 )
    .attr("font-size", 12)
    .text("Vehicles ('000s)");

  // percentage text
  svg.append("text")
    .attr("class", "percentage-text")
    .attr("text-anchor", "right")
    .attr("x", width - margin.right - 50)
    .attr("y", yAxisLabelHeight + 20 )
    .attr("font-size", 20)
    .style('fill', '#FF5733')
    .text("");

  // Animation
  svg.selectAll("rect")
    .transition()
    .duration(800)
    .attr("y", function(d) { return y(d.qty); })
    .attr("height", function(d) { return graphBottom - y(d.qty); })
    .delay(function(d,i){
      //console.log(i); 
      return(i*100)
    })
  
  graphEl.append(svg.node());

  // Enable highlighting event to show percentage of vehicles at any bucket
  graphEl.querySelectorAll('rect').forEach((rect) => {
    // Listen for when another bar is hovered over. If that bar has higher bucket, turn yellow
    eventBus.addEventListener('bar-hover', (e) => {

      if (parseInt(e.detail.bucket) >= parseInt(rect.getAttribute('bucket'))) {
        d3.select(rect).transition()
          .duration('50')
          .attr('fill', '	#FF5733'); 
      }
    })

    eventBus.addEventListener('bar-hover-off', (e) => {
      d3.select(rect).transition()
        .duration('50')
        .attr('fill', "#004080"); 
    })
  })

  // Enable text to show the percentage of the bars highlighted
  graphEl.querySelector('.percentage-text')

  eventBus.addEventListener('bar-hover', (e) => {

    const bucket = parseInt(e.detail.bucket);

    const percentage = dataPercentage[data.map(d => d.bucket).indexOf(bucket)]

    //console.log(percentage)

    graphEl.querySelector('.percentage-text').innerHTML = percentage + "%"
  })

  eventBus.addEventListener('bar-hover-off', (e) => {

    graphEl.querySelector('.percentage-text').innerHTML = ""
  })

}

export { initializeHistogram }