import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

function initializeHistogram(graphEl, fullData, eventBus) {

  const margin = {top: 10, right: 10, bottom: 15, left: 50}
  const width = 350 - margin.left - margin.right
  const height = 150;
  const xAxisLabelHeight = 20;
  const yAxisLabelHeight = 20;

  // height that the bars float above the x axis
  const floatHeight = 1;

  // Compute graph size
  const graphHeight = height - xAxisLabelHeight - yAxisLabelHeight - margin.bottom - margin.top - floatHeight;
  const graphBottom = yAxisLabelHeight + graphHeight + margin.top;

  // Declare initial dark state
  var isDark = false;

  // Process the data to make it ready for rendering
  function prepareData(raw){

    // Cumulative sum function for data preperation
    const cumSum = (sum => value => sum += value)(0);

    // Processing function to generate cumulative distribution and percentages
    // To be applied to both predictive and historical
    function getCumulative(dataInput){
      const data = dataInput.slice(0,-1)

      const dataCumulative = dataInput.map(d => d.qty).map(cumSum)
  
      const dataPercentage = dataCumulative.map(d => Math.round(d / Math.max(...dataCumulative) * 1000) / 10)

      return({data: data, cumulative: dataCumulative, percentage: dataPercentage})
    }

    // Represent quantities in 1000s
    //const scaled = raw.map((d) => {
    //  const out = d
    //  out.qty = Math.floor(d.qty)
    // return(out)
    //})

    // To get predictive, substitute qty for prediction
    const rawPredictive = raw.map((d) => {
        const out = d
        out.qty = d.prediction
        return(out)
    })

    const historical = getCumulative(raw)
    const predictive = getCumulative(rawPredictive)
    

    return({historical: historical, predictive: predictive})
  }

  // Execute data preperation
  var dataContainer = prepareData(fullData);

  // append the svg object to the body of the page
  var svg = d3.create("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("viewBox", [0, 0, width, height])
  .attr("style", "max-width: 100%; max-height: 95%; height: auto; height: intrinsic;");

  // X axis
  var x = d3.scaleLinear([0, 240], [margin.left, width - margin.right]);

  // Add X axis to graph
  svg.append("g")
    .attr("transform", `translate(0,${graphBottom + floatHeight})`)
    .call(d3.axisBottom(x).tickValues([30,60,90,120,150,180,210,240]).tickSizeOuter(0));

  // Y axis
  var y = d3.scaleLinear()
    .range([ graphBottom, graphBottom - graphHeight]);

  // Add Y axis to graph
  var yAxis = svg.append("g")
    .attr("transform", `translate(${margin.left - 5},0)`)

  // Bars
  // Initialize it at 0
  svg.selectAll(".historical")
    .data(dataContainer.historical.data)
    .enter()
    .append("rect")
      .attr("x", function(d) { return x(d.bucket) ; })
      .attr("width", 12)
      .attr("class", "historical")
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

  svg.selectAll(".predictive")
    .data(dataContainer.historical.data)
    .enter()
    .append("rect")
      .attr("x", function(d) { return x(d.bucket) ; })
      .attr("width", 12)
      .attr("class", "predictive")
      .attr("fill", "#7f1d6f")
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
    .attr("fill", "currentColor")
    .text("Parking Duration (Minutes)");

  // y-axis label
  svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "left")
    .attr("x", 8)
    .attr("y", yAxisLabelHeight - 3 )
    .attr("font-size", 12)
    .attr("fill", "currentColor")
    .text("Vehicles");

  // percentage text
  svg.append("text")
    .attr("class", "percentage-text")
    .style("font-weight", "bold")
    .attr("text-anchor", "right")
    .attr("x", width - margin.right - 70)
    .attr("y", yAxisLabelHeight + 20 )
    .attr("font-size", 20)
    .style('fill', '#004080')
    .text("");
  
  // percentage text for predictive
  svg.append("text")
    .attr("class", "percentage-text-predictive")
    .style("font-weight", "bold")
    .attr("text-anchor", "right")
    .attr("x", width - margin.right - 70)
    .attr("y", yAxisLabelHeight + 50 )
    .attr("font-size", 20)
    .style('fill', '#7f1d6f')
    .text("");
  
  graphEl.append(svg.node());

  // Activate the historical bars
  function renderHistorical(data) {
    var rects = svg.selectAll(".historical")
      .data(dataContainer.historical.data)  

    // Animation
    rects
      .enter()
      .append("rect") // Add a new rect for each new elements
      .merge(rects) // get the already existing elements as well
      .transition()
      .duration(500)
      .attr("y", function(d) { return y(d.qty); })
      .attr("height", function(d) { return graphBottom - y(d.qty); })
      .delay(function(d,i){
        //console.log(i); 
        return(i*50)
      })
  }

  // Activate the predictive bars
  function renderPredictive() {
    var rects = svg.selectAll(".predictive")
      .data(dataContainer.predictive.data)  

    // Animation
    rects
      .enter()
      .append("rect") // Add a new rect for each new elements
      .merge(rects) // get the already existing elements as well
      .transition()
      .duration(150)
      .attr("y", function(d) { return y(d.qty / 2); })
      .attr("height", function(d) { return (graphBottom - y(d.qty / 2)); })
      .delay(function(d,i){
        //console.log(i); 
        return(i*50)
      })
  }

  // Set the predictive bars to all have height 0
  function hidePredictive() {
    var rects = svg.selectAll(".predictive")

    // Animation
    rects
      .enter()
      .append("rect") // Add a new rect for each new elements
      .merge(rects) // get the already existing elements as well
      .transition()
      .duration(150)
      .attr("y", function(d) { return y(0); })
      .attr("height", function(d) { return (graphBottom - y(0)); })
      .delay(function(d,i){
        //console.log(i); 
        return(400 - i*50)
      })
  }

  // Update data and re-render the graph
  function updateGraph(){ 

    // Adjust y domain to updated data
    y.domain([0, d3.max(dataContainer.historical.data, d => d.qty)])

    yAxis
      .transition()
      .duration(400)
      .call(d3.axisLeft(y).ticks(4).tickSizeOuter(0));

    renderHistorical()
    if (isDark){
      renderPredictive()
    }
  }

  // Set up highlighting event to show percentage of vehicles at any bucket
  function initializeHighlighting(){
    graphEl.querySelectorAll('rect').forEach((rect) => {
      // Listen for when another bar is hovered over. If that bar has higher bucket, turn yellow
      eventBus.addEventListener('bar-hover', (e) => {

        const highlightColor = isDark ? "white" : "#004080"
        const strokeWidth = isDark ? "1px" : "2px"

  
        if (parseInt(e.detail.bucket) >= parseInt(rect.getAttribute('bucket'))) {
          d3.select(rect)
            .transition()
            .style("stroke", highlightColor)
            .style("stroke-width", strokeWidth); 
        }
      })
  
      eventBus.addEventListener('bar-hover-off', (e) => {
        d3.select(rect)
          .transition()
          .style("stroke-width", "0px"); 
      })
    })
  
    // Enable text to show the percentage of the bars highlighted
    graphEl.querySelector('.percentage-text')
  
    eventBus.addEventListener('bar-hover', (e) => {
  
      var bucket = parseInt(e.detail.bucket);

      function getPercentage(data, dataPercentage){
        return(dataPercentage[data.map(d => d.bucket).indexOf(bucket)])
      }
  
      const percentage = getPercentage(dataContainer.historical.data, dataContainer.historical.percentage)
      
      graphEl.querySelector('.percentage-text').innerHTML = percentage + "%"
      
      if (isDark) {
        const predictivePercentage = getPercentage(dataContainer.historical.data, dataContainer.historical.percentage)
        graphEl.querySelector('.percentage-text-predictive').innerHTML = predictivePercentage + "%"
      }
    })
  
    eventBus.addEventListener('bar-hover-off', (e) => {
  
      graphEl.querySelector('.percentage-text').innerHTML = ""
      if (isDark) {
        graphEl.querySelector('.percentage-text-predictive').innerHTML = ""
      }
    })
  
  }

  initializeHighlighting()

  // Set up event listener for when month or district filters change
  eventBus.addEventListener('filter-change', (e) => {
    
    const filterMonth = e.detail.month == "all" ? 0 : e.detail.month 
    const filterCluster = e.detail.cluster == "all" ? 0 : e.detail.cluster 

    //console.log(filterMonth)
    //console.log(fullData)

    const filteredData = fullData.filter((row) => filterMonth == row.month & filterCluster == row.cluster)
  
    //console.log(filteredData)

    // Reprepare the data again
    dataContainer = prepareData(filteredData)

    //console.log(data)

    // Render the graph
    updateGraph()
  })

  // Set up event listener for when predictive mode is activated
  eventBus.addEventListener('mode-change', (e) => {
    isDark = e.detail.isDark
    if (isDark){
      renderPredictive()
    } else {
      hidePredictive()
    }
  })  

}

export { initializeHistogram }