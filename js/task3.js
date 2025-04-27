// Set up SVG
const margin = {top: 50, right: 150, bottom: 70, left: 70},
      width  = 800 - margin.left - margin.right,
      height = 500 - margin.top  - margin.bottom;

const svg = d3.select("#chart")
  .append("svg")
    .attr("width",  width  + margin.left + margin.right)
    .attr("height", height + margin.top  + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Title
svg.append("text")
   .attr("x", width/2)
   .attr("y", -margin.top/2)
   .attr("text-anchor", "middle")
   .style("font-size", "18px")
   .style("font-weight", "bold")
   .text("Bubble Chart: Productivity Change by Work Location");

d3.csv("data/cleaned_data.csv").then(data => {
  // 1) Mapping label agar konsisten
  const labelMap = {
    "increase":    "Increase",
    "no change":   "No Change",
    "decrease":    "Decrease"
  };
  const locations = ["Hybrid","Remote","Onsite"];
  const changes   = ["Increase","No Change","Decrease"];
  const colorScale = d3.scaleOrdinal()
    .domain(changes)
    .range(["#2ecc71","#95a5a6","#e74c3c"]);

  // 2) Hitung counts
  const grouped = locations.reduce((acc, loc) => {
    acc[loc] = {Location: loc, "Increase":0, "No Change":0, "Decrease":0};
    return acc;
  }, {});
  data.forEach(d => {
    const loc    = d.Work_Location.charAt(0).toUpperCase()+d.Work_Location.slice(1).toLowerCase();
    const raw    = d.Productivity_Change.toLowerCase().trim();
    const change = labelMap[raw];
    if (grouped[loc] && change) grouped[loc][change]++;
  });

  // 3) Normalisasi ke persen & flatten
  let bubbleData = [];
  Object.values(grouped).forEach(d => {
    const total = changes.reduce((s,k)=> s + d[k], 0);
    changes.forEach(k => {
      bubbleData.push({
        Location: d.Location,
        Change: k,
        Value: d[k] / total * 100
      });
    });
  });

  // 4) Scales
  const x = d3.scalePoint()
    .domain(locations)
    .range([0, width])
    .padding(0.5);
  const y = d3.scalePoint()
    .domain(changes)
    .range([0, height])
    .padding(0.5);

  const maxVal = d3.max(bubbleData, d=> d.Value);
  const rScale = d3.scaleSqrt()
    .domain([0, maxVal])
    .range([0, 40]);  // max radius 40px

  // 5) Axes
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text").style("font-size","14px");
  svg.append("g")
    .call(d3.axisLeft(y))
    .selectAll("text").style("font-size","14px");

  // 6) Bubbles
  svg.selectAll("circle")
    .data(bubbleData)
    .enter().append("circle")
      .attr("cx", d=> x(d.Location))
      .attr("cy", d=> y(d.Change))
      .attr("r",  d=> rScale(d.Value))
      .style("fill", d=> colorScale(d.Change))
      .style("opacity", 0.7);

  // 7) Labels persentase (opsional)
  svg.selectAll(".label")
    .data(bubbleData)
    .enter().append("text")
      .attr("x", d=> x(d.Location))
      .attr("y", d=> y(d.Change)+4)
      .attr("text-anchor", "middle")
      .style("font-size", "10px")
      .style("fill", "#333")
      .text(d=> `${d.Value.toFixed(1)}%`);

  // 8) Legend
  const legend = svg.append("g")
    .attr("transform", `translate(${width + 20}, 20)`);
  changes.forEach((ch, i) => {
    const g = legend.append("g")
      .attr("transform", `translate(0, ${i*25})`);
    g.append("rect")
      .attr("width", 18).attr("height", 18)
      .style("fill", colorScale(ch));
    g.append("text")
      .attr("x", 24).attr("y", 13)
      .style("font-size", "12px")
      .text(ch);
  });
});
