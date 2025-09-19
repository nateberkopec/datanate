import { select } from 'd3-selection';
import {
    forceSimulation,
    forceLink,
    forceManyBody,
    forceCenter,
    forceCollide
} from 'd3-force';
import { drag } from 'd3-drag';
import { getTierColor } from 'helpers.js';

export function createRelationshipDiagram(metricsData, relationships) {
    // Get all unique categories
    const categories = new Set();
    Object.values(metricsData).forEach(metric => {
        categories.add(metric.config.category);
    });

    categories.forEach(category => {
        createCategoryDAG(category, metricsData, relationships);
    });
}

function createCategoryDAG(category, metricsData, relationships) {
    const container = select(`#relationships-chart-${category}`);

    if (!container.node()) return;

    const width = container.node().offsetWidth;
    const height = 300;
    const margin = {top: 20, right: 20, bottom: 20, left: 20};

    const svg = container.append('svg')
        .attr('width', width)
        .attr('height', height);

    // Build nodes and links for this category
    const { nodes, links } = buildCategoryNetwork(category, metricsData, relationships);

    if (nodes.length === 0) return;

    // Create force simulation
    const simulation = forceSimulation(nodes)
        .force('link', forceLink(links).id(d => d.id).distance(100))
        .force('charge', forceManyBody().strength(-300))
        .force('center', forceCenter(width / 2, height / 2))
        .force('collision', forceCollide().radius(25));

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
        .call(drag()
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
        const tooltip = select('#tooltip');
        tooltip.style('opacity', 1)
            .html(`${d.name}<br/>Tier ${d.tier}`)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px');
    })
    .on('mouseout', function() {
        select('#tooltip').style('opacity', 0);
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

function buildCategoryNetwork(category, metricsData, relationships) {
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