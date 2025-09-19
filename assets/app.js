import { select } from 'd3-selection';
import { renderLineChart } from './lineChart.js';
import { renderBarChart } from './barChart.js';
import { createRelationshipDiagram } from './relationshipChart.js';

const metricsData = window.metricsData;
const relationships = window.relationships;

Object.keys(metricsData).forEach(metricId => {
    const metric = metricsData[metricId];
    createChart(metricId, metric);
});

function createChart(metricId, metric) {
    const container = select(`#chart-${metricId}`);
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
        const maxValue = Math.max(...data.map(d => d.value));
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

createRelationshipDiagram(metricsData, relationships);