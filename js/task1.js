d3.csv("data/cleaned_data.csv").then(data => {
  const counts = d3.rollup(
    data,
    v => v.length,
    d => d.Mental_Health_Condition
  );

  const dataset = Array.from(counts, ([label, value]) => ({ label, value }));

  const width = 900, height = 600, radius = Math.min(width, height) / 2.5;

  const pastelColors = ["#FFD1DC", "#FFECB3", "#C8E6C9", "#BBDEFB", "#E1BEE7"];

  const color = d3.scaleOrdinal()
    .domain(dataset.map(d => d.label))
    .range(pastelColors);

  const pie = d3.pie().sort(null).value(d => d.value);
  const arc = d3.arc().innerRadius(0).outerRadius(radius);
  const arcLower = d3.arc().innerRadius(0).outerRadius(radius).cornerRadius(0);

  const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2 + 20})`);

  // Tambahkan efek 3D (lapisan bawah gelap)
  for (let depth = 10; depth > 0; depth--) {
    svg.selectAll(`.shadow${depth}`)
      .data(pie(dataset))
      .enter()
      .append("path")
      .attr("d", arcLower)
      .attr("fill", "#999")
      .attr("transform", `translate(0, ${depth})`)
      .attr("opacity", 0.1);
  }

  // Bagian atas berwarna pastel
  svg.selectAll("path.top")
    .data(pie(dataset))
    .enter()
    .append("path")
    .attr("class", "top")
    .attr("d", arc)
    .attr("fill", d => color(d.data.label))
    .attr("stroke", "#fff")
    .attr("stroke-width", "2px");

  // Label tengah
  svg.selectAll("text")
    .data(pie(dataset))
    .enter()
    .append("text")
    .attr("transform", d => `translate(${arc.centroid(d)})`)
    .attr("text-anchor", "middle")
    .attr("dy", "0.35em")
    .style("font-size", "14px")
    .style("fill", "#333")
    .text(d => `${d.data.label} (${d.data.value})`);
});
