import { scaleBand, scaleLinear } from 'd3-scale';
import { max } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';
import { select } from 'd3-selection';
import { getTimeFormat, numberWithDelimiter, showTooltip } from './helpers.js';

export function renderBarChart(layer, data, metric, width, height) {
    const xScale = scaleBand()
        .domain(data.map(d => d.date))
        .range([0, width])
        .padding(0.1);

    // Calculate y-axis domain including target if it exists
    const yMax = max(data, d => d.value);
    const targetAdjustedMax = metric.config.target ? Math.max(yMax, metric.config.target) : yMax;

    const yScale = scaleLinear()
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
        .call(axisLeft(yScale)
            .ticks(5)
            .tickSize(-width)
            .tickFormat('')
        )
        .style('stroke-dasharray', '3,3')
        .style('opacity', 0.1);

    layer.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(axisBottom(xScale).tickValues(tickValues).tickFormat(timeFormat))
        .selectAll('text')
        .style('fill', '#888');

    layer.append('g')
        .attr('class', 'axis y-axis')
        .call(axisLeft(yScale).ticks(5))
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
            select('#tooltip').style('opacity', 0);
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