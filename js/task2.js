d3.csv("data/cleaned_data.csv").then(data => {
    // Filter dan parsing
    data = data.filter(d => d.Age && d.Years_of_Experience && d.Stress_Level);
    data.forEach(d => {
      d.Age = Math.floor(+d.Age / 5) * 5; // kelompok usia per 5 tahun
      d.Years_of_Experience = Math.floor(+d.Years_of_Experience / 5) * 5; // kelompok pengalaman per 5 tahun
      d.Stress_Level = +d.Stress_Level;
    });
  
    // Buat agregat data: key = age + experience group
    const grouped = d3.rollups(
      data,
      v => d3.mean(v, d => d.Stress_Level),
      d => d.Age,
      d => d.Years_of_Experience
    );
  
    const formattedData = [];
    grouped.forEach(([age, expArr]) => {
      expArr.forEach(([experience, avgStress]) => {
        formattedData.push({
          age: +age,
          experience: +experience,
          avgStress: avgStress
        });
      });
    });
  
    const margin = { top: 40, right: 20, bottom: 60, left: 60 },
          width = 800,
          height = 500;
  
    const svg = d3.select("#chart")
      .append("svg")
      .attr("width", width)
      .attr("height", height);
  
    const xVals = [...new Set(formattedData.map(d => d.age))].sort((a,b) => a-b);
    const yVals = [...new Set(formattedData.map(d => d.experience))].sort((a,b) => a-b);
  
    const x = d3.scaleBand().domain(xVals).range([margin.left, width - margin.right]).padding(0.05);
    const y = d3.scaleBand().domain(yVals).range([margin.top, height - margin.bottom]).padding(0.05);
  
    const color = d3.scaleSequential(d3.interpolateReds)
      .domain(d3.extent(formattedData, d => d.avgStress));
  
    // Axis
    svg.append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .append("text")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("fill", "black")
      .text("Age Group");
  
    svg.append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(y))
      .append("text")
      .attr("x", -40)
      .attr("y", margin.top - 20)
      .attr("fill", "black")
      .text("Experience Group");
  
    // Kotak heatmap
    svg.selectAll("rect")
      .data(formattedData)
      .enter()
      .append("rect")
      .attr("x", d => x(d.age))
      .attr("y", d => y(d.experience))
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .attr("fill", d => color(d.avgStress))
      .append("title")
      .text(d => `Stress: ${d.avgStress.toFixed(2)}`);
  
  });  