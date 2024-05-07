d3.text(
    'https://gist.githubusercontent.com/ducpham03/2e33a9aba19ccd4a1360b1ee50621bdd/raw/613f1a123e81674ba6f14f93c59f1243b3376c5f/Boxplot_DS.csv',
  ).then(function (text) {
    const lines = text.trim().split('\n');
    const data = [];
  
    for (let i = 1; i < lines.length; i++) {
      const [jobTitle, salary] = lines[i].split(',');
      data.push({
        Job_Type: jobTitle.trim(),
        Salary: +salary,
      });
    }
  
    const jobSalaries = {};
    data.forEach((d) => {
      if (!jobSalaries[d.Job_Type]) {
        jobSalaries[d.Job_Type] = [];
      }
      jobSalaries[d.Job_Type].push(d.Salary);
    });
  
    // Calculate medians and sort job types by median salary
    const sortedJobTypes = Object.entries(jobSalaries)
      .map(([jobType, salaries]) => ({
        jobType,
        median: d3.median(salaries),
        min: d3.min(salaries),
        max: d3.max(salaries),
      }))
      .sort((a, b) => b.median - a.median)
      .map((d) => d.jobType);
  
    const topTenJobTypes = sortedJobTypes.slice(0, 10);
    const initialVisibleJobs = new Set();
  
    const width = 800;
    const height = 450;
    const margin = {
      top: 80,
      right: 40,
      bottom: 50,
      left: 220,
    };
  
    const svg = d3
      .select('#boxplot')
      .append('svg')
      .attr('width', width)
      .attr('height', height);
  
    const yScale = d3
      .scaleBand()
      .domain(topTenJobTypes)
      .range([margin.top, height - margin.bottom])
      .paddingInner(0.1)
      .paddingOuter(0.2);
  
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.Salary)])
      .nice()
      .range([margin.left, width - margin.right]);
  
    function drawBoxplots() {
      svg.selectAll('*').remove(); // Clear the SVG
  
      // Adding title
      svg
        .append('text')
        .attr('x', width / 2)
        .attr('y', margin.top / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '24px')
        .style('font-weight', 'bold')
        .text(
          'Boxplot Salaries Distribution by Job Categories',
        );
  
      // Draw y-axis and x-axis
      svg
        .append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale))
        .attr('font-size', '15px');
  
      svg
        .append('g')
        .attr(
          'transform',
          `translate(0, ${height - margin.bottom})`,
        )
        .call(
          d3.axisBottom(xScale).tickFormat(d3.format('~s')),
        )
        .attr('font-size', '15px');
  
      // Draw boxplots for visible job types
      topTenJobTypes.forEach((jobType) => {
        if (initialVisibleJobs.has(jobType)) return; // Only draw if in the initial visible set
  
        const salaries = jobSalaries[jobType];
        const boxplotGroup = svg
          .append('g')
          .attr(
            'transform',
            `translate(0,${yScale(jobType) + yScale.bandwidth() / 2})`,
          );
  
        const quartile1 = d3.quantile(
          salaries.sort(d3.ascending),
          0.25,
        );
        const quartile3 = d3.quantile(salaries, 0.75);
        const median = d3.median(salaries);
        const min = d3.min(salaries);
        const max = d3.max(salaries);
  
        // Box
        boxplotGroup
          .append('rect')
          .attr('x', xScale(quartile1))
          .attr('y', -yScale.bandwidth() / 4)
          .attr(
            'width',
            xScale(quartile3) - xScale(quartile1),
          )
          .attr('height', yScale.bandwidth() / 2)
          .attr('fill', 'lightblue')
          .attr('stroke', 'black')
          .on('mouseover', function (event, d) {
            d3.select(this).attr('fill', 'orange');
            const [x, y] = d3.pointer(event);
            showTooltip(x, y, jobType, median, min, max);
          })
          .on('mouseout', function (event, d) {
            d3.select(this).attr('fill', 'lightblue');
            hideTooltip();
          });
  
        // Median line
        boxplotGroup
          .append('line')
          .attr('x1', xScale(median))
          .attr('x2', xScale(median))
          .attr('y1', -yScale.bandwidth() / 4)
          .attr('y2', yScale.bandwidth() / 4)
          .attr('stroke', 'red');
  
        // Min and max whiskers
        boxplotGroup
          .append('line')
          .attr('x1', xScale(min))
          .attr('x2', xScale(quartile1))
          .attr('y1', 0)
          .attr('y2', 0)
          .attr('stroke', 'black');
  
        boxplotGroup
          .append('line')
          .attr('x1', xScale(max))
          .attr('x2', xScale(quartile3))
          .attr('y1', 0)
          .attr('y2', 0)
          .attr('stroke', 'black');
  
        boxplotGroup
          .append('line')
          .attr('x1', xScale(min))
          .attr('x2', xScale(min))
          .attr('y1', -yScale.bandwidth() / 4)
          .attr('y2', yScale.bandwidth() / 4)
          .attr('stroke', 'black');
  
        boxplotGroup
          .append('line')
          .attr('x1', xScale(max))
          .attr('x2', xScale(max))
          .attr('y1', -yScale.bandwidth() / 4)
          .attr('y2', yScale.bandwidth() / 4)
          .attr('stroke', 'black');
      });
    }
  
    drawBoxplots();
  
    // Setup checkbox controls for the top 10 job types
    const checkboxContainer = d3.select('#boxplot-controls');
  
    // Create checkboxes for all job types in a single row
    const checkboxes = checkboxContainer
      .selectAll('.boxplot-checkbox-group')
      .data(topTenJobTypes)
      .enter()
      .append('div')
      .attr('class', 'boxplot-checkbox-group');
  
    checkboxes
      .append('input')
      .attr('type', 'checkbox')
      .attr('id', (d, i) => 'checkbox_' + i)
      .property('checked', true)
      .on('change', (event, jobType) => {
        if (event.target.checked) {
          initialVisibleJobs.delete(jobType);
        } else {
          initialVisibleJobs.add(jobType);
        }
        drawBoxplots();
      });
  
    checkboxes
      .append('label')
      .attr('for', (d, i) => 'checkbox_' + i)
      .text((d) => d);
  
      function showTooltip(x, y, jobType, median, min, max) {
        const formatNumber = d3.format(','); // Formatter for comma-separated values
        tooltip
          .style('left', `${x + 10}px`)
          .style('top', `${y + 10}px`)
          .html(
            `
                      <strong>${jobType}</strong><br>
                      Max: $${formatNumber(max)}<br>
                      Median: $${formatNumber(median)}<br>
                      Min: $${formatNumber(min)}
                  `,
          )
          .style('display', 'block'); // Make sure the tooltip is shown
      }
    
      const tooltip = d3
        .select('body')
        .append('div')
        .attr('class', 'boxplot_tooltip');
    
      function hideTooltip() {
        tooltip.style('display', 'none');
      }
    
      // Update tooltip position on mousemove
      d3.select('svg').on('mousemove', function (event) {
        const [x, y] = d3.pointer(event);
        tooltip
          .style('left', x + 30 + 'px')
          .style('top', y + 10 + 'px');
      });
    });
  