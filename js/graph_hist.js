import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

function initializeHistogram(graphEl, fullData, eventBus) {

  const margin = {top: 10, right: 10, bottom: 25, left: 50}
  const width = 350 - margin.left - margin.right
  const height = 200;
  const xAxisLabelHeight = 20;
  const yAxisLabelHeight = 20;

  // height that the bars float above the x axis
  const floatHeight = 1;

  // Compute graph size
  const graphHeight = height - xAxisLabelHeight - yAxisLabelHeight - margin.bottom - margin.top - floatHeight;
  const graphBottom = yAxisLabelHeight + graphHeight + margin.top;

  // Define data containers
  var data, dataCumulative, dataPercentage;

  // Process the data to make it ready for rendering
  function prepareData(raw){

    // Cumsum function for data preperation
    const cumSum = (sum => value => sum += value)(0);

    // Represent quantities in 1000s
    const scaled = raw.map((d) => {
      const out = d
      out.qty = Math.floor(d.qty)
      return(out)
    })

    //console.log(scaled)
    
    data = scaled.slice(0,-1)

    //console.log(data)

    dataCumulative = scaled.map(d => d.qty).map(cumSum)

    dataPercentage = dataCumulative.map(d => Math.round(d / Math.max(...dataCumulative) * 1000) / 10)
  }

  // Execute data preperation
  prepareData(fullData);

  //console.log(data)

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
    .range([ graphBottom, graphBottom - graphHeight]);

  var yAxis = svg.append("g")
    .attr("transform", `translate(${margin.left - 5},0)`)

  // Bars
  // Initialize it at 0
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
        const barHovered = new CustomEvent('bar-hover', { detail: { bucket: this.getAttribute('bucket') }});
        eventBus.dispatchEvent(barHovered); 
      })
      .on('mouseout', function (d, i) {
        // Dispatch coresponding even when bar is hovered off
        const barHoveredOff = new CustomEvent('bar-hover-off');
        eventBus.dispatchEvent(barHoveredOff); 
      })

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
  
  graphEl.append(svg.node());

  // Update data and re-render the graph
  function updateGraph(){ 

    // Adjust y domain to updated data
    y.domain([0, d3.max(data, d => d.qty)])

    console.log(d3.max(data, d => d.qty))

    yAxis
      .transition()
      .duration(400)
      .call(d3.axisLeft(y).tickSizeOuter(0));


    var rects = svg.selectAll("rect")
      .data(data)  

    // Animation
    rects
      .enter()
      .append("rect") // Add a new rect for each new elements
      .merge(rects) // get the already existing elements as well
      .transition()
      .duration(100)
      .attr("y", function(d) { return y(d.qty); })
      .attr("height", function(d) { return graphBottom - y(d.qty); })
      .delay(function(d,i){
        //console.log(i); 
        return(250 + i*50)
      })
  }

  // Set up highlighting event to show percentage of vehicles at any bucket
  function initializeHighlighting(){
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
  
      var bucket = parseInt(e.detail.bucket);
  
      var percentage = dataPercentage[data.map(d => d.bucket).indexOf(bucket)]
  

      //console.log(dataCumulative)
      //console.log(percentage)
  
      graphEl.querySelector('.percentage-text').innerHTML = percentage + "%"
    })
  
    eventBus.addEventListener('bar-hover-off', (e) => {
  
      graphEl.querySelector('.percentage-text').innerHTML = ""
    })
  
  }

  initializeHighlighting()

  

  eventBus.addEventListener('filter-change', (e) => {
    
    const filterMonth = e.detail.month == "all" ? 0 : e.detail.month 
    const filterCluster = e.detail.cluster == "all" ? 0 : e.detail.cluster 

    //console.log(filterMonth)
    //console.log(fullData)

    const filteredData = fullData.filter((row) => filterMonth == row.month & filterCluster == row.cluster)
  
    //console.log(filteredData)

    // Reprepare the data again
    prepareData(filteredData)

    //console.log(data)

    // Render the graph
    updateGraph()
  })


  

}

export { initializeHistogram }