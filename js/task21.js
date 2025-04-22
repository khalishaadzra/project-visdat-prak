d3.csv("data/cleaned_data.csv").then(data => {
    data = data.filter(d => d.Age && d.Years_of_Experience && d.Stress_Level);
  
    data.forEach(d => {
      d.Age = +d.Age;
      d.Years_of_Experience = +d.Years_of_Experience;
      d.Stress_Level = +d.Stress_Level;
    });
  
    const width = 800, height = 500, margin = { top: 40, right: 30, bottom: 50, left: 60 };
  
    const svg = d3.select("#chart")
      .append("svg")
      .attr("width", width)
      .attr("height", height);
  
    const x = d3.scaleLinear()
      .domain(d3.extent(data, d => d.Age))
      .range([margin.left, width - margin.right]);
  
    const y = d3.scaleLinear()
      .domain(d3.extent(data, d => d.Years_of_Experience))
      .range([height - margin.bottom, margin.top]);
  
    const color = d3.scaleSequential(d3.interpolateReds)
      .domain(d3.extent(data, d => d.Stress_Level));
  
    svg.append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(10))
      .append("text")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("fill", "black")
      .text("Age");
  
    svg.append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(y).ticks(10))
      .append("text")
      .attr("x", -margin.left)
      .attr("y", margin.top - 20)
      .attr("fill", "black")
      .text("Years of Experience");
  
    svg.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.Age))
      .attr("cy", d => y(d.Years_of_Experience))
      .attr("r", 5)
      .attr("fill", d => color(d.Stress_Level))
      .attr("opacity", 0.7);
  });  