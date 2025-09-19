const metricsData = window.metricsData;
const relationships = window.relationships;

function numberWithDelimiter(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

Object.keys(metricsData).forEach(metricId => {
    const metric = metricsData[metricId];
    createChart(metricId, metric);
});

function createChart(metricId, metric) {
    const container = d3.select(`#chart-${metricId}`);
    if (!container.node()) return;

    const svg = container.append('svg');
    const g = svg.append('g');

    const data = metric.data.map(d => ({
        date: new Date(d.date),
        value: +d.value
    }));

    function render(w, h) {
        g.selectAll("*").remove();

        // Calculate dynamic left margin based on max y-value
        const maxValue = d3.max(data, d => d.value);
        const targetValue = metric.config.target || 0;
        const displayMax = Math.max(maxValue, targetValue);
        const labelWidth = displayMax.toString().length * 10 + 25; // More generous width estimate
        const leftMargin = Math.max(50, Math.min(labelWidth, 100)); // Between 50-100px

        const margin = {top: 10, right: 30, bottom: 30, left: leftMargin};
        const innerW = Math.max(0, w - margin.left - margin.right);
        const innerH = Math.max(0, h - margin.top - margin.bottom);

        if (innerW <= 0 || innerH <= 0) return;

        const layer = g.attr("transform", `translate(${margin.left},${margin.top})`);

        if (metric.config.chart_type === 'bar') {
            renderBarChart(layer, data, metric, innerW, innerH);
        } else {
            renderLineChart(layer, data, metric, innerW, innerH);
        }
    }

    const ro = new ResizeObserver(entries => {
        const rect = entries[0].contentRect;
        const w = Math.max(1, Math.floor(rect.width));
        const h = Math.max(1, Math.floor(rect.height || 200));
        svg.attr("width", w).attr("height", h).attr("viewBox", `0 0 ${w} ${h}`);
        render(w, h);
    });
    ro.observe(container.node());
}

function renderLineChart(layer, data, metric, width, height) {
    const xScale = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        .range([0, width]);

    // Calculate y-axis domain including target if it exists
    const dataExtent = d3.extent(data, d => d.value);
    const maxValue = metric.config.target ?
        Math.max(dataExtent[1], metric.config.target) :
        dataExtent[1];
    const minValue = metric.config.target ?
        Math.min(dataExtent[0], metric.config.target) :
        dataExtent[0];

    // Add 10% padding to the top
    const yDomain = [minValue, maxValue * 1.1];

    const yScale = d3.scaleLinear()
        .domain(yDomain)
        .nice()
        .range([height, 0]);

    // Add axes with time-dimension-appropriate formatting
    const timeFormat = getTimeFormat(metric.config.time_dimension);
    layer.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickFormat(timeFormat))
        .selectAll('text')
        .style('fill', '#888');

    layer.append('g')
        .attr('class', 'axis y-axis')
        .call(d3.axisLeft(yScale).ticks(5))
        .selectAll('text')
        .style('fill', '#888');

    // Add grid lines
    layer.append('g')
        .attr('class', 'grid')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale)
            .tickSize(-height)
            .tickFormat('')
        )
        .style('stroke-dasharray', '3,3')
        .style('opacity', 0.1);

    // Add line
    const line = d3.line()
        .x(d => xScale(d.date))
        .y(d => yScale(d.value))
        .curve(d3.curveMonotoneX);

    layer.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#4ECDC4')
        .attr('stroke-width', 2)
        .attr('d', line);

    // Add dots
    layer.selectAll('.dot')
        .data(data)
        .enter().append('circle')
        .attr('class', 'dot')
        .attr('cx', d => xScale(d.date))
        .attr('cy', d => yScale(d.value))
        .attr('r', 3)
        .attr('fill', '#4ECDC4')
        .on('mouseover', function(event, d) {
            showTooltip(event, d, metric);
        })
        .on('mouseout', function() {
            d3.select('#tooltip').style('opacity', 0);
        });

    // Add target line if target exists
    if (metric.config.target) {
        const targetY = yScale(metric.config.target);

        layer.append('line')
            .attr('class', 'target-line')
            .attr('x1', 0)
            .attr('x2', width)
            .attr('y1', targetY)
            .attr('y2', targetY)
            .attr('stroke', '#FFD93D')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '5,5');

        layer.append('text')
            .attr('class', 'target-label')
            .attr('x', width - 5)
            .attr('y', targetY - 5)
            .attr('text-anchor', 'end')
            .style('fill', '#FFD93D')
            .style('font-weight', '500')
            .text(`Target: ${numberWithDelimiter(metric.config.target)}`);
    }
}

function renderBarChart(layer, data, metric, width, height) {
    const xScale = d3.scaleBand()
        .domain(data.map(d => d.date))
        .range([0, width])
        .padding(0.1);

    // Calculate y-axis domain including target if it exists
    const yMax = d3.max(data, d => d.value);
    const targetAdjustedMax = metric.config.target ? Math.max(yMax, metric.config.target) : yMax;

    const yScale = d3.scaleLinear()
        .domain([0, targetAdjustedMax * 1.1])
        .nice()
        .range([height, 0]);

    // Add axes
    const timeFormat = getTimeFormat(metric.config.time_dimension);
    const maxTicks = 8;
    const tickValues = data.length > maxTicks ?
        data.filter((d, i) => i % Math.ceil(data.length / maxTicks) === 0).map(d => d.date) :
        data.map(d => d.date);

    // Add grid lines first (so they appear behind bars)
    layer.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft(yScale)
            .ticks(5)
            .tickSize(-width)
            .tickFormat('')
        )
        .style('stroke-dasharray', '3,3')
        .style('opacity', 0.1);

    layer.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickValues(tickValues).tickFormat(timeFormat))
        .selectAll('text')
        .style('fill', '#888');

    layer.append('g')
        .attr('class', 'axis y-axis')
        .call(d3.axisLeft(yScale).ticks(5))
        .selectAll('text')
        .style('fill', '#888');

    // Add bars
    layer.selectAll('.bar')
        .data(data)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(d.date))
        .attr('width', xScale.bandwidth())
        .attr('y', d => yScale(d.value))
        .attr('height', d => height - yScale(d.value))
        .attr('fill', '#4ECDC4')
        .on('mouseover', function(event, d) {
            showTooltip(event, d, metric);
        })
        .on('mouseout', function() {
            d3.select('#tooltip').style('opacity', 0);
        });

    // Add target line if target exists
    if (metric.config.target) {
        const targetY = yScale(metric.config.target);

        layer.append('line')
            .attr('class', 'target-line')
            .attr('x1', 0)
            .attr('x2', width)
            .attr('y1', targetY)
            .attr('y2', targetY)
            .attr('stroke', '#FFD93D')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '5,5');

        layer.append('text')
            .attr('class', 'target-label')
            .attr('x', width - 5)
            .attr('y', targetY - 5)
            .attr('text-anchor', 'end')
            .style('fill', '#FFD93D')
            .style('font-weight', '500')
            .text(`Target: ${numberWithDelimiter(metric.config.target)}`);
    }
}

function getTimeFormat(timeDimension) {
    switch(timeDimension) {
        case 'weekly':
            return d3.timeFormat('%m/%d');
        case 'monthly':
            return d3.timeFormat('%b');
        case 'daily':
            return d3.timeFormat('%m/%d');
        default:
            return d3.timeFormat('%b');
    }
}

function showTooltip(event, d, metric) {
    const tooltip = d3.select('#tooltip');
    tooltip.style('opacity', 1)
        .html(`${d.date.toLocaleDateString()}<br/>${numberWithDelimiter(d.value)} ${metric.config.unit}`)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px');
}

function createRelationshipDiagram() {
    // Get all unique categories
    const categories = new Set();
    Object.values(metricsData).forEach(metric => {
        categories.add(metric.config.category);
    });

    categories.forEach(category => {
        createCategoryDAG(category);
    });
}

function createCategoryDAG(category) {
    const container = d3.select(`#relationships-chart-${category}`);

    if (!container.node()) return;

    const width = container.node().offsetWidth;
    const height = 300;
    const margin = {top: 20, right: 20, bottom: 20, left: 20};

    const svg = container.append('svg')
        .attr('width', width)
        .attr('height', height);

    // Build nodes and links for this category
    const { nodes, links } = buildCategoryNetwork(category);

    if (nodes.length === 0) return;

    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(100))
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(25));

    // Create links
    const link = svg.append('g')
        .attr('class', 'links')
        .selectAll('line')
        .data(links)
        .enter().append('line')
        .attr('stroke', '#666')
        .attr('stroke-width', 2)
        .attr('marker-end', 'url(#arrowhead)');

    // Create arrowhead marker
    svg.append('defs').append('marker')
        .attr('id', 'arrowhead')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 20)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#666');

    // Create nodes
    const node = svg.append('g')
        .attr('class', 'nodes')
        .selectAll('g')
        .data(nodes)
        .enter().append('g')
        .attr('class', 'node')
        .call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended));

    node.append('circle')
        .attr('r', 15)
        .attr('fill', d => getTierColor(d.tier))
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);

    node.append('text')
        .attr('dy', '.35em')
        .attr('text-anchor', 'middle')
        .style('fill', '#fff')
        .style('font-size', '10px')
        .style('font-weight', 'bold')
        .style('pointer-events', 'none')
        .text(d => d.name.split(' ').map(word => word.charAt(0)).join(''));

    // Add tooltips
    node.on('mouseover', function(event, d) {
        const tooltip = d3.select('#tooltip');
        tooltip.style('opacity', 1)
            .html(`${d.name}<br/>Tier ${d.tier}`)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px');
    })
    .on('mouseout', function() {
        d3.select('#tooltip').style('opacity', 0);
    });

    // Update positions on simulation tick
    simulation.on('tick', () => {
        link
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);

        node
            .attr('transform', d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
}

function buildCategoryNetwork(category) {
    const nodes = [];
    const links = [];
    const nodeMap = {};

    // Create nodes for this category
    Object.keys(metricsData).forEach(metricId => {
        const metric = metricsData[metricId];
        if (metric.config.category === category) {
            const node = {
                id: metricId,
                name: metric.config.display_name,
                tier: metric.config.tier || 0,
                category: category
            };
            nodes.push(node);
            nodeMap[metricId] = node;
        }
    });

    // Create links based on relationships within this category
    Object.keys(relationships).forEach(metricId => {
        const rel = relationships[metricId];
        if (rel.influences && nodeMap[metricId]) {
            rel.influences.forEach(targetId => {
                if (nodeMap[targetId]) {
                    links.push({
                        source: targetId,
                        target: metricId
                    });
                }
            });
        }
    });

    return { nodes, links };
}

function getTierColor(tier) {
    switch(tier) {
        case 0: return '#FF6B6B';
        case 1: return '#FFD93D';
        case 2: return '#6BCF7F';
        case 3: return '#9B59B6';
        case 4: return '#E67E22';
        default: return '#888';
    }
}

createRelationshipDiagram();