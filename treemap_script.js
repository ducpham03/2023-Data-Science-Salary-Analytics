// Set the dimensions and margins of the graph
var margin = { top: 20, right: 0, bottom: 0, left: 0 },
    width = 800 ,
    height = 500; 


var svg = d3.select('#my_dataviz')
    .append('svg')
    .attr('width', 800)  
    .attr('height', 500)  
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

d3.json('https://gist.githubusercontent.com/ducpham03/3f6f1698dd87b6ad531184e16cf37ae9/raw/f146daf9292c22aa28739fe551e9025e445f57a2/TreeMap.json').then(function (data) {
    console.log(data);

    // Define a color scale
    var color = d3.scaleOrdinal(d3.schemeCategory10);

    // Assign a color index for each category based on its position
    var categories = {};
    data.children.forEach(function (child, index) {
        categories[child.name] = index;
    });

    var root = d3.hierarchy(data).sum(function (d) {
        return d.value;
    });
    d3.treemap().size([width, height]).padding(2)(root);

    // Select and add rectangles for each leaf node
    svg.selectAll('rect')
        .data(root.leaves())
        .enter()
        .append('rect')
        .attr('x', function (d) { return d.x0; })
        .attr('y', function (d) { return d.y0; })
        .attr('width', function (d) { return d.x1 - d.x0; })
        .attr('height', function (d) { return d.y1 - d.y0; })
        .style('stroke', 'black')
        .style('fill', function (d) { return color(categories[d.parent.data.name]); }) // Color based on parent category
        .on('mouseover', function (event, d) {
            // Show tooltip on mouseover
            d3.select('#treemap_tooltip')
                .html(`<strong style='color: ${color(categories[d.parent.data.name])};'>Job Category: ${d.parent.data.name}</strong><br>
                        <strong>Job Title: ${d.data.name}</strong><br>
                        Average Salary: $${d.data.salary.toLocaleString()}<br>
                        Number of Observations: ${d.data.value}`)
                .style('left', event.pageX + 10 + 'px')
                .style('top', event.pageY + 10 + 'px')
                .style('display', 'block');
        })
        .on('mouseout', function () {
            // Hide tooltip on mouseout
            d3.select('#treemap_tooltip').style('display', 'none');
        });

    // Add text labels only to leaf nodes
    svg.selectAll('text')
        .data(root.leaves())
        .enter()
        .append('text')
        .attr('x', function (d) { return d.x0 + 5; }) // (more right)
        .attr('y', function (d) { return d.y0 + 20; }) // (higher)
        .text(function (d) { return d.data.name; })
        .attr('font-size', function (d) { return Math.min(20, (d.x1 - d.x0) / 8) + 'px'; })
        .attr('fill', 'white')
        .style('text-overflow', 'ellipsis')
        .style('white-space', 'nowrap')
        .style('overflow', 'hidden')
        .attr('width', function (d) { return d.x1 - d.x0 - 10; });
});

