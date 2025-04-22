d3.csv("data/cleaned_data.csv").then(function(data) {
    // Normalisasi ke huruf kecil semua
    data.forEach(d => {
      d.Work_Location = d.Work_Location.toLowerCase();
      d.Productivity_Change = d.Productivity_Change.toLowerCase();
    });
  
    const workLocations = ["hybrid", "remote", "onsite"];
    const categories = ["increase", "decrease", "no change"];
  
    // Hitung jumlah per kategori untuk setiap work location
    const grouped = {};
    workLocations.forEach(loc => {
      grouped[loc] = { total: 0 };
      categories.forEach(cat => {
        grouped[loc][cat] = 0;
      });
    });
  
    data.forEach(d => {
      if (grouped[d.Work_Location]) {
        grouped[d.Work_Location].total++;
        if (grouped[d.Work_Location][d.Productivity_Change] !== undefined) {
          grouped[d.Work_Location][d.Productivity_Change]++;
        }
      }
    });
  
    // Buat data final dalam bentuk array untuk chart
    const finalData = [];
    workLocations.forEach(loc => {
      categories.forEach(cat => {
        const total = grouped[loc].total;
        const value = total > 0 ? (grouped[loc][cat] / total) * 100 : 0;
        finalData.push({
          work_location: loc,
          category: cat,
          value: value
        });
      });
    });
  
    // Setup chart
    const margin = { top: 60, right: 20, bottom: 50, left: 60 },
          width = 800 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;
  
    const svg = d3.select("#chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
    const x0 = d3.scaleBand()
      .domain(workLocations)
      .range([0, width])
      .paddingInner(0.2);
  
    const x1 = d3.scaleBand()
      .domain(categories)
      .range([0, x0.bandwidth()])
      .padding(0.05);
  
    const y = d3.scaleLinear()
      .domain([0, 50])
      .nice()
      .range([height, 0]);
  
    const color = d3.scaleOrdinal()
      .domain(categories)
      .range(["#2ecc71", "#e74c3c", "#f1c40f"]);
  
    svg.append("g")
      .selectAll("g")
      .data(workLocations)
      .enter()
      .append("g")
      .attr("transform", d => `translate(${x0(d)},0)`)
      .selectAll("rect")
      .data(d => categories.map(cat => {
        const item = finalData.find(fd => fd.work_location === d && fd.category === cat);
        return { category: cat, value: item.value };
      }))
      .enter()
      .append("rect")
      .attr("x", d => x1(d.category))
      .attr("y", d => y(d.value))
      .attr("width", x1.bandwidth())
      .attr("height", d => height - y(d.value))
      .attr("fill", d => color(d.category));
  
    svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x0));
  
    svg.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y).ticks(10).tickFormat(d => d + "%"));
  
    // Legend
    const legend = svg.selectAll(".legend")
      .data(categories)
      .enter()
      .append("g")
      .attr("transform", (d, i) => `translate(${i * 140}, -40)`);
  
    legend.append("rect")
      .attr("x", 0)
      .attr("width", 18)
      .attr("height", 18)
      .attr("fill", d => color(d));
  
    legend.append("text")
      .attr("x", 25)
      .attr("y", 14)
      .text(d => d.charAt(0).toUpperCase() + d.slice(1));
  
  });  