const margin = { top: 40, right: 30, bottom: 50, left: 60 },
  width = 800 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

const svg = d3.select("#chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

d3.csv("data/cleaned_data.csv").then(data => {
  const grouped = d3.groups(data, d => d.Work_Location);
  const summary = grouped.map(([location, values]) => {
    const avgChange = d3.mean(values, d => +d.Productivity_Change);
    return { location, avgChange };
  });

  const x = d3.scaleBand()
    .domain(summary.map(d => d.location))
    .range([0, width])
    .padding(0.3);

  const y = d3.scaleLinear()
    .domain([
      d3.min(summary, d => d.avgChange) * 1.2,
      d3.max(summary, d => d.avgChange) * 1.2
    ])
    .nice()
    .range([height, 0]);

  svg.append("g")
    .attr("transform", `translate(0,${y(0)})`)
    .call(d3.axisBottom(x));

  svg.append("g")
    .call(d3.axisLeft(y));

  svg.selectAll(".bar")
    .data(summary)
    .enter()
    .append("rect")
    .attr("x", d => x(d.location))
    .attr("width", x.bandwidth())
    .attr("y", d => d.avgChange >= 0 ? y(d.avgChange) : y(0))
    .attr("height", d => Math.abs(y(d.avgChange) - y(0)))
    .attr("fill", "#4a90e2");

  svg.selectAll(".label")
    .data(summary)
    .enter()
    .append("text")
    .attr("x", d => x(d.location) + x.bandwidth() / 2)
    .attr("y", d => d.avgChange >= 0 ? y(d.avgChange) - 5 : y(0) + 15)
    .attr("text-anchor", "middle")
    .attr("fill", "#000")
    .text(d => d.avgChange.toFixed(2));

  // Add baseline at y = 0
  svg.append("line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", y(0))
    .attr("y2", y(0))
    .attr("stroke", "black");
});