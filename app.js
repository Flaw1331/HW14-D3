// Setting up variables
var svgWidth = 960;
var svgHeight = 520;

var margin = { top: 20, right: 40, bottom: 60, left: 80 };

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create SVG wrapper
var svg = d3.select("body")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var chart = svg.append('g');

// Append a div to the body to create tooltips, assign it a class
d3.select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// Import CSV
d3.csv("./data/data.csv", function (error, csvData) {

  // Error Check
  if (error) throw error;

  // Format the data
  csvData.forEach(function (data) {
    data.med_inc = +data.med_inc
    data.phys_act = +data.phys_act
  });

  // Set the ranges with scaling functions
  var xLinearScale = d3.scaleLinear()
    .range([0, width]);

  var yLinearScale = d3.scaleLinear()
    .range([height, 0]);

  // Create axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // Scale the X-domain
  xLinearScale.domain([
    d3.min(csvData, function (data) {
      return data.med_inc*(95/100);
    }),
    d3.max(csvData, function (data) {
      return data.med_inc*(105/100);
    })
  ]);

  // Scale the Y-domain
  yLinearScale.domain([
    d3.min(csvData, function (data) {
      return data.phys_act*(99/100);
    }),
    d3.max(csvData, function (data) {
      return data.phys_act*(101/100);
    })
  ]);

  // Creating tooltips
  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([0, -100])
    .html(function(data) {
      var stateName = data.state;
      var stateAbbr = data.abbr;
      var medInc = +data.med_inc;
      var physAct = +data.phys_act;
      return (`${stateName} - ${stateAbbr}<br>Median HH Income: ${medInc}<br>Phys Act This Month: ${physAct}%`);
    });

  // Calling Tooltips
  chart.call(toolTip);

  // Plotting circles
  chart.selectAll('circle')
    .data(csvData)
    .enter().append('circle')
      .attr("cx", function (data, index) {
        return xLinearScale(data.med_inc);
      })
      .attr("cy", function (data, index) {
        return yLinearScale(data.phys_act);
      })
      .attr("stroke", "white")
      .attr("r", "9")
      .attr("fill", "red")
      .on("mouseover", function(data, index) {
        toolTip.show(data);
      })
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });

  // State Abbr add
  chart.selectAll('g')
    .data(csvData)
    .enter()
    .append("text")
    .attr("x", function (data, index) { return (xLinearScale(data.med_inc) - 6); })
    .attr("y", function (data, index) { return (yLinearScale(data.phys_act) + 3); })
    .text(function (data, index) {
      return data.abbr;
    })
    .attr('fill', 'white')
    .style("font-size", "8px");

  // Adding axis
  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(bottomAxis)
    .style('stroke', 'white')
    .style('fill', 'white')
    .style('font-size', '10px');

  svg.append('g')
    .call(leftAxis)
    .style('fill', 'white')
    .style('stroke', 'white');

  // Labeling Y-Axis
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 75 - (height))
    .attr("dy", "1em")
    .style('fill', 'white')
    .style("font-size", "20px")
    .text('Physical Activity Past Month (%)');

  // Labeling X-Axis
  svg.append("text")
    .attr("transform",
    "translate(" + (width / 3) + " ," +
    (height + margin.top + 40) + ")")
    .style('fill', 'white')
    .style("font-size", "20px")
    .text("Median Household Income 2014 ($)");
});