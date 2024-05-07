document.addEventListener("DOMContentLoaded", function() {
    const width = 600;
    const height = 450;
    const margin = { top: 100, right: 200, bottom: 50, left: 100 };

    const svg = d3.select('#my_dataviz2')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const meanSalaries = {
        'Entry-level': 94233,
        'Mid-level': 122527,
        Senior: 165700,
        Executive: 189496,
    };

    d3.csv(
        'https://gist.githubusercontent.com/ducpham03/14a066d7bbcc936f8940400a7849a4c4/raw/64a54361dab26016aa14e93d8a1b8b7ee3df71c9/experience_level.csv',
      ).then((data) => {
        data.forEach(
          (d) => (d.salary_in_usd = +d.salary_in_usd),
        );
    
        const y = d3
          .scaleLinear()
          .domain([0, 300000])
          .range([height, 0]);
        svg
          .append('g')
          .call(d3.axisLeft(y).tickFormat(d3.format('~s')))
          .attr('font-size', '16px');

        const x = d3
          .scaleBand()
          .range([0, width])
          .domain([
            'Entry-level',
            'Mid-level',
            'Senior',
            'Executive',
          ])
          .padding(0.05);
        svg
          .append('g')
          .attr('transform', `translate(0,${height})`)
          .call(d3.axisBottom(x))
          .attr('font-size', '18px');

        const sumstat = d3.rollups(
          data,
          (v) =>
            kernelDensityEstimator(
              kernelEpanechnikov(0.1),
              y.ticks(30),
            )(v.map((g) => g.salary_in_usd)),
          (d) => d.experience_level,
        );

        const maxNum = d3.max(sumstat, ([, value]) =>
          d3.max(value, (d) => d[1]),
        );
        const xNum = d3
          .scaleLinear()
          .range([0, x.bandwidth()])
          .domain([-maxNum, maxNum]);

        svg
          .selectAll('myViolin')
          .data(sumstat)
          .enter()
          .append('g')
          .attr(
            'transform',
            (d) => `translate(${x(d[0])},0)`,
          )
          .append('path')
          .datum((d) => d[1])
          .style('stroke', 'none')
          .style('fill', '#69b3a2')
          .attr(
            'd',
            d3
              .area()
              .x0((d) => xNum(-d[1]))
              .x1((d) => xNum(d[1]))
              .y((d) => y(d[0]))
              .curve(d3.curveCatmullRom),
          )
          .on('mouseover', function () {
            d3.select(this).style('fill', 'orange');
          })
          .on('mouseout', function () {
            d3.select(this).style('fill', '#69b3a2');
          });

        // Adding annotations for each violin plot
        Object.entries(meanSalaries).forEach(
          ([level, salary], i) => {
            let text = svg
              .append('text')
              .attr('x', x(level) + x.bandwidth() / 2)
              .attr('y', y(salary) - 20)
              .attr('text-anchor', 'middle')
              .style('font-size', '16px')
              .style('font-weight', 'bold');

            // Append first tspan for 'Average Salary'
            text
              .append('tspan')
              .attr('x', x(level) + x.bandwidth() / 2)
              .attr('dy', '1.2em')
              .text('Average Salary');

            // Append second tspan for the actual salary value
            text
              .append('tspan')
              .attr('x', x(level) + x.bandwidth() / 2)
              .attr('dy', '1.2em')
              .text(`$${salary.toLocaleString()}`);
          },
        );

        svg
          .append('text')
          .attr('x', width / 2)
          .attr('y', -70)
          .attr('text-anchor', 'middle')
          .style('font-size', '25px')
          .style('font-weight', 'bold')
          .text(
            'Violin Plot of Salary Distribution by Experience Level',
          );
      });


    function kernelDensityEstimator(kernel, X) {
        return function (V) {
            return X.map((x) => [
                x,
                d3.mean(V, (v) => kernel(x - v)),
            ]);
        };
    }

    function kernelEpanechnikov(k) {
        return function (v) {
            return Math.abs((v /= k)) <= 1
                ? (0.75 * (1 - v * v)) / k
                : 0;
        };
    }
});
