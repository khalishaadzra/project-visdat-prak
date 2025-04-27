const margin = { top: 50, right: 120, bottom: 70, left: 60 },
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

const chartDiv = d3.select("#chart");

const container = chartDiv
  .append("div")
  .attr("style", "border: 2px solid #ccc; border-radius: 8px; padding: 20px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);");

container.append("h2")
  .text("Task 4: Hubungan Jam Kerja dan Aktivitas Fisik terhadap Work-Life Balance");

const svg = container.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height * 2 + margin.top + margin.bottom + 100) // supaya muat 2 grafik
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const tooltip = d3.select("body").append("div")
  .attr("class", "tooltip");

d3.csv("data/cleaned_data.csv").then(data => {
  data.forEach(d => {
    d.Hours_Worked_Per_Week = +d.Hours_Worked_Per_Week;
    d.Work_Life_Balance_Rating = +d.Work_Life_Balance_Rating;
  });

  // Pisahkan berdasarkan Physical Activity
  const dailyData = data.filter(d => d.Physical_Activity === "Daily Physical Activity");
  const weeklyData = data.filter(d => d.Physical_Activity === "Weekly Physical Activity");

  const datasets = [
    { name: "Daily Physical Activity", data: dailyData, yOffset: 0 },
    { name: "Weekly Physical Activity", data: weeklyData, yOffset: height + 100 }
  ];

  datasets.forEach(dataset => {
    const grouped = d3.group(dataset.data, d => d.Hours_Worked_Per_Week);
    const sortedData = Array.from(grouped, ([hour, values]) => ({
      hour: +hour,
      avgWLB: d3.mean(values, v => v.Work_Life_Balance_Rating)
    })).sort((a, b) => a.hour - b.hour);

    const x = d3.scaleLinear()
      .domain(d3.extent(sortedData, d => d.hour))
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, 5])
      .range([height, 0]);

    const line = d3.line()
      .x(d => x(d.hour))
      .y(d => y(d.avgWLB));

    const g = svg.append("g")
      .attr("transform", `translate(0,${dataset.yOffset})`);

    g.append("g")
      .call(d3.axisLeft(y))
      .call(g => g.select(".domain").attr("stroke-width", 2))
      .call(g => g.selectAll(".tick line").attr("stroke-width", 1))
      .call(g => g.selectAll("text").style("font-weight", "bold"));

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .call(g => g.select(".domain").attr("stroke-width", 2))
      .call(g => g.selectAll(".tick line").attr("stroke-width", 1))
      .call(g => g.selectAll("text").style("font-weight", "bold"));

    g.append("path")
      .datum(sortedData)
      .attr("fill", "none")
      .attr("stroke", dataset.name === "Daily Physical Activity" ? "#FF7F50" : "#6495ED")
      .attr("stroke-width", 2.5)
      .attr("d", line);

    g.selectAll(".dot")
      .data(sortedData)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.hour))
      .attr("cy", d => y(d.avgWLB))
      .attr("r", 4)
      .attr("fill", dataset.name === "Daily Physical Activity" ? "#FF7F50" : "#6495ED")
      .on("mouseover", function (event, d) {
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip.html(`
          <strong>Jam Kerja:</strong> ${d.hour}<br/>
          <strong>Rata-rata WLB:</strong> ${d.avgWLB.toFixed(2)}
        `)
        .style("left", (event.pageX + 15) + "px")
        .style("top", (event.pageY - 30) + "px");
      })
      .on("mouseout", function () {
        tooltip.transition().duration(500).style("opacity", 0);
      });

    g.append("text")
      .attr("x", width / 2)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text(dataset.name);

    g.append("text")
      .attr("x", -height / 2)
      .attr("y", -45)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("Work-Life Balance Rating");

    g.append("text")
      .attr("x", width / 2)
      .attr("y", height + 50)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("Jam Kerja per Minggu");
  });
});
