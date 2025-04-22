const width = 800;
const height = 500;
const margin = { top: 30, right: 30, bottom: 40, left: 50 };

const svg = d3
  .select("#chart")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const g = svg
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

d3.csv("data/cleaned_data.csv").then((data) => {
  // Convert numeric values
  data.forEach((d) => {
    d.Age = +d.Age;
    d.Years_of_Experience = +d.Years_of_Experience;
    d.Stress_Level = +d.Stress_Level;
  });

  // Adjust the age and experience ranges
  data.forEach((d) => {
    d.Age = Math.floor(d.Age / 5) * 5; // Group ages in 5-year intervals
    d.Years_of_Experience = Math.floor(d.Years_of_Experience / 5) * 5; // Group experience in 5-year intervals
  });

  // Define scales
  const xScale = d3
    .scaleLinear()
    .domain([d3.min(data, (d) => d.Age), d3.max(data, (d) => d.Age)])
    .range([0, width - margin.left - margin.right])
    .nice();

  const yScale = d3
    .scaleLinear()
    .domain([
      d3.min(data, (d) => d.Years_of_Experience),
      d3.max(data, (d) => d.Years_of_Experience),
    ])
    .range([height - margin.top - margin.bottom, 0])
    .nice();

  const zScale = d3
    .scaleSqrt()
    .domain([0, d3.max(data, (d) => d.Stress_Level)])
    .range([5, 20]); // Adjust bubble sizes based on Stress Level

  const colorScale = d3.scaleSequential(d3.interpolateYlOrRd).domain([1, 5]);

  // Draw circles (scatter plot)
  g.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d) => xScale(d.Age))
    .attr("cy", (d) => yScale(d.Years_of_Experience))
    .attr("r", (d) => zScale(d.Stress_Level))
    .style("fill", (d) => colorScale(d.Stress_Level))
    .style("opacity", 0.7)
    .on("mouseover", (event, d) => {
      const tooltip = d3.select("#tooltip");
      tooltip
        .style("visibility", "visible")
        .html(
          `Age: ${d.Age}<br>Experience: ${d.Years_of_Experience}<br>Stress: ${d.Stress_Level}`
        );
    })
    .on("mousemove", (event) => {
      d3.select("#tooltip")
        .style("top", `${event.pageY + 10}px`)
        .style("left", `${event.pageX + 10}px`);
    })
    .on("mouseout", () => {
      d3.select("#tooltip").style("visibility", "hidden");
    });

  // Add axes
  g.append("g")
    .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
    .call(d3.axisBottom(xScale).ticks(10));

  g.append("g").call(d3.axisLeft(yScale).ticks(10));
});
