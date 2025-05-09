import { mount } from 'svelte'
import * as d3 from 'd3';

export const numButtons = 4;
export const buttons: HTMLButtonElement[] = [];

export function sendInterrupt(i: number) {
    const svg = d3.select<SVGSVGElement, unknown>("#svg-canvas");
    const rect = buttons[i].getBoundingClientRect();

    const line = d3.line<[number, number]>()
        .x(d => d[0])
        .y(d => d[1])
        .curve(d3.curveLinear);
    const pathData = [
        [100, 100],
        [200, 200],
        [800, 200],
        [950, 400],
        [200, 600],
        [1000, 500],
        [300, 600],
        [50, 650]
    ]
    const path = svg.append('path')
        .attr('d', line(pathData)!)
        .attr('stroke', 'orange')
        .attr('stroke-width', 2)
        .attr('fill', 'none');

    const totalLength = (path.node() as SVGPathElement).getTotalLength();

    path
        .attr('stroke-dasharray', totalLength)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(2000)
        .ease(d3.easeLinear)
        .attr('stroke-dashoffset', 0);
}
