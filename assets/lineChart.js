import { scaleTime, scaleLinear } from 'd3-scale';
import { line, curveMonotoneX } from 'd3-shape';
import { max, extent } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';
import { select } from 'd3-selection';
import { getTimeFormat, numberWithDelimiter, showTooltip } from './helpers.js';

export function renderLineChart(layer, data, metric, width, height) {
    const xScale = scaleTime()
        .domain(extent(data, d => d.date))
        .range([0, width]);

    // Calculate y-axis domain including target if it exists
    const dataExtent = extent(data, d => d.value);
    const maxValue = metric.config.target ?
        Math.max(dataExtent[1], metric.config.target) :
        dataExtent[1];
    const minValue = metric.config.target ?
        Math.min(dataExtent[0], metric.config.target) :
        dataExtent[0];

    // Add 10% padding to the top
    const yDomain = [minValue, maxValue * 1.1];

    const yScale = scaleLinear()
        .domain(yDomain)
        .nice()
        .range([height, 0]);

    // Add axes with time-dimension-appropriate formatting
    const timeFormat = getTimeFormat(metric.config.time_dimension);
    layer.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(axisBottom(xScale).tickFormat(timeFormat))
        .selectAll('text')
        .style('fill', '#888');

    layer.append('g')
        .attr('class', 'axis y-axis')
        .call(axisLeft(yScale).ticks(5))
        .selectAll('text')
        .style('fill', '#888');


    // Add line
    const lineGenerator = line()
        .x(d => xScale(d.date))
        .y(d => yScale(d.value))
        .curve(curveMonotoneX);

    layer.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#4ECDC4')
        .attr('stroke-width', 2)
        .attr('d', lineGenerator);

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