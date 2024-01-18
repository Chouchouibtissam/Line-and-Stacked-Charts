// Specify the chart’s dimensions.
    // Specify the chart’s dimensions.
    const width = 860;
    const height = 450;
    const marginTop = 20;
    const marginRight = 0;
    const marginBottom = 30;
    const marginLeft = 50;
    
    const parseDate = d3.timeParse("%d-%m-%Y");
    data.forEach(function (d) {
      d.date = parseDate(d.date);
    });
    // Create the positional scales.
    const x = d3.scaleUtc()
      .domain(d3.extent(data, d => d.date))
      .range([marginLeft, width - marginRight]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.number)]).nice()
      .range([height - marginBottom, marginTop]);

    // Create the SVG container.
    const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "font: 10px sans-serif;")
      .style("margin","auto");

    // Add the horizontal axis.
    svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));

    // Add the vertical axis.
    svg.append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y))
      .call(g => g.select(".domain").remove())
      .call(g => g.append("text")
        .attr("x", -marginLeft)
        .attr("y", 10)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .text("Persons"));


    // Compute the points in pixel space as [x, y, z], where z is the name of the series.
    const points = data.map((d) => [x(d.date), y(d.number), d.fatalities]);
    console.log(data)
    // An optional Voronoi display (for fun).


    // Group the points by series.
    const groups = d3.rollup(points, v => Object.assign(v, { z: v[0][2] }), d => d[2]);
    console.log(groups)
    // Draw the lines.
    const line = d3.line();
    const path = svg.append("g")
    .attr("fill", "none")
    .attr("stroke-width", 1.5)
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .selectAll("path")
    .data(groups.values())
    .join("path")
    .style("mix-blend-mode", "multiply")
    .attr("d", line)
    .attr("stroke", ({ z }) => z === 'Daily_Killed_Persons' ? "red" : "steelblue"); // Change 'YourSpecificValue' to the value you want to highlight
  

    // Add an invisible layer for the interactive tip.
    const dot = svg.append("g")
      .attr("display", "none");

    dot.append("circle")
      .attr("r", 2.5);

    dot.append("text")
      .attr("text-anchor", "middle")
      .attr("y", -8);

    svg
      .on("pointerenter", pointerentered)
      .on("pointermove", pointermoved)
      .on("pointerleave", pointerleft)
      .on("touchstart", event => event.preventDefault());
    // When the pointer moves, find the closest point, update the interactive tip, and highlight
    // the corresponding line. Note: we don't actually use Voronoi here, since an exhaustive search
    // is fast enough.
    function pointermoved(event) {
      const [xm, ym] = d3.pointer(event);
      const i = d3.leastIndex(points, ([x, y]) => Math.hypot(x - xm, y - ym));
      const [x, y, k] = points[i];
  
      // Personnalisation des étiquettes en fonction du type de série (z)
      let labelType;
      if (k === 'Daily_Injured_Persons') {
          labelType = 'Injured_Persons';
      } else if (k === 'Daily_Killed_Persons') {
          labelType = 'Killed_Persons';
      } else {
          labelType = 'Persons';
      }
  
      const dateLabel = d3.timeFormat("%d-%m-%Y")(data[i].date);
      const numberLabel = data[i].number;
  
      console.log(`Date: ${dateLabel}, ${labelType}: ${numberLabel}`);
  
      path.style("stroke", ({ z }) => z === k ? null : "#ddd").filter(({ z }) => z === k).raise();
      dot.attr("transform", `translate(${x},${y})`);
      dot.select("text").text(`Date: ${dateLabel}\n${labelType}: ${numberLabel}`);
      svg.property("value", data[i]).dispatch("input", { bubbles: true });
  }
  
    function pointerentered() {
      path.style("mix-blend-mode", null).style("stroke", "#ddd");
      dot.attr("display", null);
    }

    function pointerleft() {
      path.style("mix-blend-mode", "multiply").style("stroke", null);
      dot.attr("display", "none");
      svg.node().value = null;
      svg.dispatch("input", { bubbles: true });
    }
    // Append the SVG to the chart container
    document.getElementById('chart-container').appendChild(svg.node());