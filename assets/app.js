const metricsData = window.metricsData;
const relationships = window.relationships;

function numberWithDelimiter(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

Object.keys(metricsData).forEach(metricId => {
    const metric = metricsData[metricId];
    const container = d3.select(`#chart-${metricId}`);

    if (!container.node()) return;

    const margin = {top: 10, right: 30, bottom: 30, left: 40};
    const width = container.node().offsetWidth - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;

    const svg = container.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const data = metric.data.map(d => ({
        date: new Date(d.date),
        value: +d.value
    }));

    const xScale = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.value))
        .nice()
        .range([height, 0]);

    const line = d3.line()
        .x(d => xScale(d.date))
        .y(d => yScale(d.value))
        .curve(d3.curveMonotoneX);

    g.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat('%b')))
        .selectAll('text')
        .style('fill', '#888');

    g.append('g')
        .call(d3.axisLeft(yScale).ticks(5))
        .selectAll('text')
        .style('fill', '#888');

    g.append('g')
        .attr('class', 'grid')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale)
            .tickSize(-height)
            .tickFormat('')
        )
        .style('stroke-dasharray', '3,3')
        .style('opacity', 0.1);

    g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#4ECDC4')
        .attr('stroke-width', 2)
        .attr('d', line);

    g.selectAll('.dot')
        .data(data)
        .enter().append('circle')
        .attr('class', 'dot')
        .attr('cx', d => xScale(d.date))
        .attr('cy', d => yScale(d.value))
        .attr('r', 3)
        .attr('fill', '#4ECDC4')
        .on('mouseover', function(event, d) {
            const tooltip = d3.select('#tooltip');
            tooltip.style('opacity', 1)
                .html(`${d.date.toLocaleDateString()}<br/>${numberWithDelimiter(d.value)} ${metric.config.unit}`)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 10) + 'px');
        })
        .on('mouseout', function() {
            d3.select('#tooltip').style('opacity', 0);
        });
});

function createRelationshipDiagram() {
    const container = d3.select('#relationships-chart');
    const width = container.node().offsetWidth;
    const height = 400;
    const margin = {top: 20, right: 90, bottom: 30, left: 90};

    const svg = container.append('svg')
        .attr('width', width)
        .attr('height', height);

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    function buildHierarchy() {
        const metricNodes = {};
        const rootNodes = [];

        Object.keys(metricsData).forEach(metricId => {
            const metric = metricsData[metricId];
            metricNodes[metricId] = {
                id: metricId,
                name: metric.config.display_name,
                category: metric.config.category,
                tier: metric.config.tier || 0,
                children: []
            };
        });

        Object.keys(relationships).forEach(metricId => {
            const rel = relationships[metricId];
            if (rel.influences) {
                rel.influences.forEach(childId => {
                    if (metricNodes[childId]) {
                        metricNodes[metricId].children.push(metricNodes[childId]);
                    }
                });
            }
        });

        const childIds = new Set();
        Object.values(metricNodes).forEach(node => {
            node.children.forEach(child => childIds.add(child.id));
        });

        Object.values(metricNodes).forEach(node => {
            if (!childIds.has(node.id)) {
                rootNodes.push(node);
            }
        });

        const categoryTrees = {};
        rootNodes.forEach(root => {
            if (!categoryTrees[root.category]) {
                categoryTrees[root.category] = {
                    name: root.category,
                    children: []
                };
            }
            categoryTrees[root.category].children.push(root);
        });

        return Object.values(categoryTrees);
    }

    const categoryTrees = buildHierarchy();

    const treeLayout = d3.tree()
        .size([height - margin.top - margin.bottom, width - margin.left - margin.right]);

    const treeHeight = (height - margin.top - margin.bottom) / categoryTrees.length;

    categoryTrees.forEach((categoryData, index) => {
        const root = d3.hierarchy(categoryData);
        const adjustedTreeLayout = d3.tree()
            .size([treeHeight - 20, width - margin.left - margin.right]);
        adjustedTreeLayout(root);

        const yOffset = index * treeHeight + treeHeight / 2;
        root.descendants().forEach(d => d.x += yOffset);

        g.selectAll(`.link-${index}`)
            .data(root.links())
            .enter().append('path')
            .attr('class', `link link-${index}`)
            .attr('d', d3.linkHorizontal()
                .x(d => d.y)
                .y(d => d.x))
            .style('fill', 'none')
            .style('stroke', '#666')
            .style('stroke-width', 2);

        const node = g.selectAll(`.node-${index}`)
            .data(root.descendants())
            .enter().append('g')
            .attr('class', `node node-${index}`)
            .attr('transform', d => `translate(${d.y},${d.x})`);

        node.append('circle')
            .attr('r', d => d.data.tier !== undefined ? 8 : 6)
            .style('fill', d => {
                if (d.data.tier === undefined) return '#444';
                switch(d.data.tier) {
                    case 0: return '#FF6B6B';
                    case 1: return '#FFD93D';
                    case 2: return '#6BCF7F';
                    case 3: return '#9B59B6';
                    case 4: return '#E67E22';
                    default: return '#888';
                }
            })
            .style('stroke', '#fff')
            .style('stroke-width', 2);

        node.append('text')
            .attr('dy', '.35em')
            .attr('x', d => d.children ? -13 : 13)
            .style('text-anchor', d => d.children ? 'end' : 'start')
            .style('fill', '#fff')
            .style('font-size', d => d.data.tier !== undefined ? '12px' : '14px')
            .style('font-weight', d => d.data.tier !== undefined ? 'normal' : 'bold')
            .text(d => d.data.name);
    });
}

createRelationshipDiagram();