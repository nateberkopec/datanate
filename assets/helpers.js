import { timeFormat } from 'd3-time-format';
import { select } from 'd3-selection';

export function numberWithDelimiter(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function getTierColor(tier) {
    switch(tier) {
        case 0: return '#FF6B6B';
        case 1: return '#FFD93D';
        case 2: return '#6BCF7F';
        case 3: return '#9B59B6';
        case 4: return '#E67E22';
        default: return '#888';
    }
}

export function getTimeFormat(timeDimension) {
    switch(timeDimension) {
        case 'weekly':
            return timeFormat('%m/%d');
        case 'monthly':
            return timeFormat('%b');
        case 'daily':
            return timeFormat('%m/%d');
        default:
            return timeFormat('%b');
    }
}

export function showTooltip(event, d, metric) {
    const tooltip = select('#tooltip');
    tooltip.style('opacity', 1)
        .html(`${d.date.toLocaleDateString()}<br/>${numberWithDelimiter(d.value)} ${metric.config.unit}`)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px');
}