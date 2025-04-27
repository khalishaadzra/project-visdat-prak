const margin = { top: 50, right: 120, bottom: 70, left: 60 },
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

// Tambahkan container dengan border
const container = d3.select("#chart")
  .append("div")
  .attr("style", "border: 2px solid #ccc; border-radius: 8px; padding: 20px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);");

const svg = container.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const tooltip = d3.select("body").append("div")
  .attr("class", "tooltip");

d3.csv("data/cleaned_data.csv").then(data => {
  // Bin hours worked
  data.forEach(d => {
    d.Hours_Worked_Per_Week = +d.Hours_Worked_Per_Week;
    d.Work_Life_Balance_Rating = +d.Work_Life_Balance_Rating;

    if (d.Hours_Worked_Per_Week < 30) d.bin = "<30";
    else if (d.Hours_Worked_Per_Week <= 40) d.bin = "30-40";
    else if (d.Hours_Worked_Per_Week <= 50) d.bin = "40-50";
    else d.bin = ">50";
  });

  // Nest data
  const nested = Array.from(d3.group(data, d => d.bin, d => d.Physical_Activity),
    ([bin, groups]) => ({
      bin,
      activities: Array.from(groups, ([activity, values]) => ({
        activity,
        avg: d3.mean(values, d => d.Work_Life_Balance_Rating)
      }))
    })
  );

  // Definisikan urutan yang benar
  const binOrder = ["<30", "30-40", "40-50", ">50"];
  const activities = Array.from(new Set(data.map(d => d.Physical_Activity)));

  const x0 = d3.scaleBand().domain(binOrder).range([0, width]).padding(0.2);
  const x1 = d3.scaleBand().domain(activities).range([0, x0.bandwidth()]).padding(0.05);
  const y = d3.scaleLinear().domain([0, 5]).nice().range([height, 0]);
  const color = d3.scaleOrdinal().domain(activities).range(["#FFB347", "#779ECB", "#77DD77"]);

  svg.append("g")
    .call(d3.axisLeft(y))
    .call(g => g.select(".domain").attr("stroke-width", 2))
    .call(g => g.selectAll(".tick line").attr("stroke-width", 1))
    .call(g => g.selectAll("text").style("font-weight", "bold"));

  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x0))
    .call(g => g.select(".domain").attr("stroke-width", 2))
    .call(g => g.selectAll(".tick line").attr("stroke-width", 1))
    .call(g => g.selectAll("text").style("font-weight", "bold"));

  svg.selectAll("g.bar-group")
    .data(nested)
    .enter()
    .append("g")
    .attr("transform", d => `translate(${x0(d.bin)},0)`)
    .selectAll("rect")
    .data(d => d.activities.map(a => ({ bin: d.bin, ...a })))
    .enter()
    .append("rect")
    .attr("x", d => x1(d.activity))
    .attr("y", d => y(d.avg))
    .attr("width", x1.bandwidth())
    .attr("height", d => height - y(d.avg))
    .attr("fill", d => color(d.activity))
    .on("mouseover", function (event, d) {
      tooltip.transition().duration(200).style("opacity", .9);
      tooltip.html(
        `<strong>Jam Kerja:</strong> ${d.bin}<br/>
         <strong>Aktivitas:</strong> ${d.activity}<br/>
         <strong>Rata-rata WLB:</strong> ${d.avg.toFixed(2)}`
      )
      .style("left", (event.pageX + 15) + "px")
      .style("top", (event.pageY - 30) + "px");
      d3.select(this).attr("opacity", 0.7);
    })
    .on("mouseout", function () {
      tooltip.transition().duration(500).style("opacity", 0);
      d3.select(this).attr("opacity", 1);
    });

  // Label Y dengan font bold
  svg.append("text")
    .attr("x", -height / 2)
    .attr("y", -40)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text("Rata-rata Work-Life Balance");

  // Label X dengan font bold
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + 50)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text("Jam Kerja per Minggu");
    
  // Tambahkan legend
  const legend = svg.append("g")
    .attr("font-family", "sans-serif")
    .attr("font-size", 12)
    .attr("text-anchor", "start")
    .selectAll("g")
    .data(activities)
    .join("g")
    .attr("transform", (d, i) => `translate(${width + 20}, ${i * 20})`);

  legend.append("rect")
    .attr("x", 0)
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill", d => color(d));

  legend.append("text")
    .attr("x", 20)
    .attr("y", 7.5)
    .attr("dy", "0.32em")
    .style("font-weight", "semi-bold")
    .text(d => d);
    
  // Tambahkan border dan background untuk legend
  const legendBBox = legend.node().getBBox();
  svg.append("rect")
    .attr("x", width + 10)
    .attr("y", legendBBox.y - 10)
    .attr("width", legendBBox.width + 20)
    .attr("height", legendBBox.height + 40)
    .attr("fill", "white")
    .attr("stroke", "#ccc")
    .attr("stroke-width", 1)
    .attr("rx", 5)
    .lower();
    
});