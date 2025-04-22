// Full 3D-style Pie Chart with Multiple Slices

d3.csv("data/cleaned_data.csv").then(data => {
  const counts = d3.rollup(
    data,
    v => v.length,
    d => d.Mental_Health_Condition
  );

  const dataset = Array.from(counts, ([label, value]) => ({ label, value }));

  const width = 900, height = 600, radius = Math.min(width, height) / 2.5;
  const depth = 20;

  const pastelColors = ["#FFD1DC", "#FFECB3", "#C8E6C9", "#BBDEFB", "#E1BEE7", "#FFCCBC", "#D1C4E9"];

  const color = d3.scaleOrdinal()
    .domain(dataset.map(d => d.label))
    .range(pastelColors);

  const pie = d3.pie().sort(null).value(d => d.value);
  const arc = d3.arc().innerRadius(0).outerRadius(radius);
  const arcLower = d3.arc().innerRadius(0).outerRadius(radius);

  const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2 + depth})`);

  const pieData = pie(dataset);

  // Render slices with 3D depth (draw from back to front based on angle)
  pieData.forEach((d, i) => {
    // Buat sisi bawah/ketebalan dari setiap slice
    for (let z = depth; z > 0; z--) {
      svg.append("path")
        .attr("d", arcLower(d))
        .attr("fill", d3.color(color(d.data.label)).darker(1.5))
        .attr("transform", `translate(0, ${z})`)
        .attr("opacity", 0.3);
    }
  });

  // Slice bagian atas
  svg.selectAll("path.top")
    .data(pieData)
    .enter()
    .append("path")
    .attr("class", "top")
    .attr("d", arc)
    .attr("fill", d => color(d.data.label))
    .attr("stroke", "#fff")
    .attr("stroke-width", "2px");

  // Label tengah
  svg.selectAll("text")
    .data(pieData)
    .enter()
    .append("text")
    .attr("transform", d => `translate(${arc.centroid(d)})`)
    .attr("text-anchor", "middle")
    .attr("dy", "0.35em")
    .style("font-size", "14px")
    .style("fill", "#333")
    .text(d => `${d.data.label} (${d.data.value})`);
});
