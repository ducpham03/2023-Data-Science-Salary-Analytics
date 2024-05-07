// document.addEventListener("DOMContentLoaded", function() {

d3.text(
  'https://gist.githubusercontent.com/ducpham03/28e459910a1238eb2b5346ed2c0de2d5/raw/c5438de3a7b361e9f75f7c5fd72a17a21368f17b/Job_Title_DS.csv',
).then(function (text) {
  const lines = text.split('\n');
  let data = [];

  lines.forEach(function (line) {
    if (line.trim() !== '') {
      const parts = line.split(',');
      const jobTitle = parts[0];
      const salary = +parts[1];
      data.push({
        Job_Title: jobTitle,
        Salary: salary,
        Visible: true,
      });
    }
  });

  data.sort((a, b) => b.Salary - a.Salary);

  const width = 900;
  const height = 450;
  const margin = {
    top: 80,
    right: 150,
    bottom: 50,
    left: 215,
  };

  const svg = d3
    .select('#chart')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  // Chart title
  svg
    .append('text')
    .attr('x', -40 + width / 2)
    .attr('y', -20 + margin.top / 2)
    .attr('text-anchor', 'middle')
    .style('font-size', '24px')
    .style('font-weight', 'bold')
    .text('Top 5 Average Salaries in Data Science in 2023');

  const updateChart = () => {
    const visibleData = data.filter((d) => d.Visible);

    const yScale = d3
      .scaleBand()
      .domain(visibleData.map((d) => d.Job_Title))
      .range([margin.top, height - margin.bottom])
      .padding(0.1);

    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(visibleData, (d) => d.Salary)])
      .nice()
      .range([margin.left, width - margin.right]);

    svg.selectAll('rect').remove();
    svg.selectAll('g').remove();

    const bars = svg
      .selectAll('rect')
      .data(visibleData)
      .enter()
      .append('rect')
      .attr('y', (d) => yScale(d.Job_Title))
      .attr('x', margin.left)
      .attr('height', yScale.bandwidth())
      .attr('width', (d) => xScale(d.Salary) - margin.left)
      .attr('fill', 'steelblue');

    // Axes
    svg
      .append('g')
      .attr(
        'transform',
        `translate(0,${height - margin.bottom})`,
      )
      .call(
        d3.axisBottom(xScale).tickFormat(d3.format('~s')),
      )
      .selectAll('text')
      .style('font-size', '15px');

    svg
      .append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('font-size', '15px');

    // Tooltip
    bars
    .on('mouseover', function (event, d) {
      d3.select(this).attr('fill', 'orange');
      d3.select('#tooltip')
        .style('visibility', 'visible')
        .html(
          `<strong>${d.Job_Title}</strong><br>
          <strong>Average Salary: $${d.Salary.toLocaleString()}</strong>`
        )
        .style('font-size', '18px')
        .style('left', event.pageX + 10 + 'px')
        .style('top', event.pageY + 10 + 'px')
        .style('text-align', 'left')
        .style('background', '#fff')
        .style('padding', '10px')
        .style('border-radius', '8px')
        .style('box-shadow', '2px 2px 5px rgba(0,0,0,0.2)');
    })
    .on('mouseout', function () {
      d3.select(this).attr('fill', 'steelblue');
      d3.select('#tooltip').style('visibility', 'hidden');
    });
  
  };

  // Checkbox to clear all checks
  const clearAllCheckbox = d3
    .select('#controls')
    .append('div')
    .attr('class', 'checkbox-group');
  clearAllCheckbox
    .append('input')
    .attr('type', 'checkbox')
    .attr('id', 'clear_all')
    .on('change', function (event) {
      const checked = event.target.checked;
      data.forEach((d) => (d.Visible = !checked));
      d3.selectAll('.checkbox-group input').property(
        'checked',
        !checked,
      );
      updateChart();
    });
  clearAllCheckbox
    .append('label')
    .attr('for', 'clear_all')
    .text('Clear All');

  // Individual checkboxes
  const checkboxContainer = d3.select('#controls');
  data.forEach((d, i) => {
    const label = checkboxContainer
      .append('div')
      .attr('class', 'checkbox-group')
      .append('label');

    label
      .append('input')
      .attr('type', 'checkbox')
      .property('checked', i < 5)
      .on('change', function (event) {
        d.Visible = event.target.checked;
        updateChart();
      });
    label.append('span').text(d.Job_Title);

    d.Visible = i < 5;
  });

  updateChart();
});

// });