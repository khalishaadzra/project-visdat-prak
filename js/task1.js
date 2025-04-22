d3.csv("data/cleaned_data.csv").then(data => {
    const counts = d3.rollup(
      data,
      v => v.length,
      d => d.Mental_Health_Condition
    );
  
    const dataset = Array.from(counts, ([label, value]) => ({ label, value }));
  
    const width = 600, height = 400, radius = Math.min(width, height) / 2;
  
    const color = d3.scaleOrdinal(d3.schemeCategory10);
  
    const pie = d3.pie().value(d => d.value);
    const arc = d3.arc().innerRadius(0).outerRadius(radius);
  
    const svg = d3.select("#chart")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);
  
    const arcs = svg.selectAll("arc")
      .data(pie(dataset))
      .enter()
      .append("g");
  
    arcs.append("path")
      .attr("d", arc)
      .attr("fill", d => color(d.data.label));
  
    arcs.append("text")
      .attr("transform", d => `translate(${arc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text(d => `${d.data.label} (${d.data.value})`);
  });  