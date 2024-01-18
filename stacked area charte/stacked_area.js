
// set the dimensions and margins of the graph
const margin = { top: 60, right: 0, bottom: 50, left: 50 },
    width = 1000 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        `translate(${margin.left}, ${margin.top})`);

// Parse the Data
d3.csv("ordered_data.csv").then(function (data) {


    //////////
    // GENERAL //
    //////////
    // Parse the date values
    const parseDate = d3.timeParse("%d-%m-%Y");
    data.forEach(function (d) {
        d.date = parseDate(d.date);
    });

    // List of groups = header of the csv files
    const keys = data.columns.slice(1)
    //console.log(keys)
    // color palette
    const color = d3.scaleOrdinal()
        .domain(keys)
        .range(d3.schemeSet2);

    //stack the data?
    const stackedData = d3.stack()
        .keys(keys)
        (data)
    console.log(keys)



    //////////
    // AXIS //
    //////////

    // Add X axis
    const x = d3.scaleUtc()
        .domain(d3.extent(data, function (d) { return d.date; }))
        .range([0, width]);
    const xAxis = svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));

    // Add X axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height + 40)
        .text("Date");

    // Add Y axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", 0)
        .attr("y", -20)
        .text("Persons")
        .attr("text-anchor", "start")

    // Add Y axis
    const y = d3.scaleLinear()
        .domain([0, 80000])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y).ticks(5))



    //////////
    // BRUSHING AND CHART //
    //////////

    // Add a clipPath: everything out of this area won't be drawn.
    const clip = svg.append("defs").append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", width)
        .attr("height", height)
        .attr("x", 0)
        .attr("y", 0);

    // Add brushing
    const brush = d3.brushX()                 // Add the brush feature using the d3.brush function
        .extent([[0, 0], [width, height]]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
        .on("end", updateChart) // Each time the brush selection changes, trigger the 'updateChart' function

    // Create the scatter variable: where both the circles and the brush take place
    const areaChart = svg.append('g')
        .attr("clip-path", "url(#clip)")

    // Area generator
    const area = d3.area()
        .x(function (d) { return x(d.data.date); })
        .y0(function (d) { return y(d[0]); })
        .y1(function (d) { return y(d[1]); })

    // Show the areas
    areaChart
        .selectAll("mylayers")
        .data(stackedData)
        .join("path")
        .attr("class", function (d) { return "myArea " + d.key })
        .style("fill", function (d) { return color(d.key); })
        .attr("d", area)

    // Add the brushing
    areaChart
        .append("g")
        .attr("class", "brush")
        .call(brush);

    let idleTimeout
    function idled() { idleTimeout = null; }

    // A function that update the chart for given boundaries
    function updateChart(event, d) {

        extent = event.selection

        // If no selection, back to initial coordinate. Otherwise, update X axis domain
        if (!extent) {
            if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
            x.domain(d3.extent(data, function (d) { return d.date; }))
        } else {
            x.domain([x.invert(extent[0]), x.invert(extent[1])])
            areaChart.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
        }

        // Update axis and area position
        xAxis.transition().duration(1000).call(d3.axisBottom(x).ticks(5))
        areaChart
            .selectAll("path")
            .transition().duration(1000)
            .attr("d", area)
    }
    //////////
    // LEGEND //
    //////////

    d3.select("#dayd")
        .style("background-color", color(keys[0]))

    d3.select("#dayi")
        .style("background-color", color(keys[1]))
    d3.select("#cumd")
        .style("background-color", color(keys[2]))
    d3.select("#cumi")
        .style("background-color", color(keys[3]))

    //////////
    // HIGHLIGHT GROUP //
    //////////

    // ================ Daily Deaths ========================

    d3.select("#dailydeaths")
        .attr('type', 'checkbox')
        .on("change", function () {
            if (d3.select("#dailydeaths").property("checked")) {
                d3.selectAll(".myArea").style("opacity", .1)
                // expect the one that is hovered
                d3.select(".dailyDeaths").style("opacity", 1)
            }
            else {
                d3.selectAll(".myArea").style("opacity", 1)
            }
        })





    d3.selectAll("input[name='stats']").on("change", function () {
        d3.select('input[name="reset"]:checked').property("checked",false);
        var selected = d3.select('input[name="stats"]:checked').property("value");
        d3.selectAll(".myArea").style("opacity", .1)
        // expect the one that is hovered
        d3.select("." + selected).style("opacity", 1)
    })

    d3.selectAll("input[name='reset']").on("change", function () {
        d3.select('input[name="stats"]:checked').property("checked",false);
        d3.selectAll(".myArea").style("opacity", 1)
    })









    // ================ Daily injuries ========================

    d3.select("#dailyinjuries")
        .attr('type', 'checkbox')
        .on("change", function () {
            if (d3.select("#dailyinjuries").property("checked")) {
                d3.selectAll(".myArea").style("opacity", .1)
                // expect the one that is hovered
                d3.select(".dailyInjuries").style("opacity", 1)
            }
            else {
                d3.selectAll(".myArea").style("opacity", 1)
            }
        })
    // ================ Cumulative deaths ========================

    d3.select("#cumdeaths")
        .attr('type', 'checkbox')
        .on("change", function () {
            if (d3.select("#cumdeaths").property("checked")) {
                d3.selectAll(".myArea").style("opacity", .1)
                // expect the one that is hovered
                d3.select(".cumDeaths").style("opacity", 1)
            }
            else {
                d3.selectAll(".myArea").style("opacity", 1)
            }
        })

    // ================ Cumulative injuries ========================

    d3.select("#cuminjuries")
        .attr('type', 'checkbox')
        .on("change", function () {
            if (d3.select("#cuminjuries").property("checked")) {
                d3.selectAll(".myArea").style("opacity", .1)
                // expect the one that is hovered
                d3.select(".cumInjuries").style("opacity", 1)
            }
            else {
                d3.selectAll(".myArea").style("opacity", 1)
            }
        })


})