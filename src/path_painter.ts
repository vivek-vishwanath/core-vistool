import * as d3 from 'd3';
import {Callback} from "./handler";

export interface Path {

    drawPath(time: number): Callback
}

export class PointPath implements Path {

    private svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, undefined>;
    pathData: [number, number][] = [];
    private svgRect: DOMRect | undefined;

    constructor(svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, undefined>, pathData: [number, number][]) {
        this.svg = svg;
        this.pathData = pathData;
        this.svgRect = this.svg.node()?.getBoundingClientRect();
    }

    line = d3.line<[number, number]>()
        .x(d => d[0] - (this.svgRect?.left ?? 0))
        .y(d => d[1] - (this.svgRect?.top ?? 0))
        .curve(d3.curveLinear);

    drawPath(time: number): Callback {
        const path = this.svg.append('path')
            .attr('d', this.line(this.pathData)!)
            .attr('stroke', 'orange')
            .attr('stroke-width', 2)
            .attr('fill', 'none');

        const totalLength = (path.node() as SVGPathElement).getTotalLength();
        const callback = new Callback(() => {console.log("initial callback")});

        path
            .attr('stroke-dasharray', totalLength)
            .attr('stroke-dashoffset', totalLength)
            .transition()
            .duration(time)
            .ease(d3.easeLinear)
            .attr('stroke-dashoffset', 0)
            .on("end", () => { callback.function() });
        return callback;
    }
}

export class VectorPath implements Path {

    pointPath: PointPath;

    constructor(svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, undefined>, start: [number, number], vectorData: [number, number][]) {
        let pathData: [number, number][] = []
        let posX = start[0];
        let posY = start[1];
        pathData.push([posX, posY]);
        for (let i = 0; i < vectorData.length; i++) {
            posX += vectorData[i][0];
            posY += vectorData[i][1];
            pathData.push([posX, posY]);
        }
        this.pointPath = new PointPath(svg, pathData);
    }

    drawPath(time: number): Callback {
        return this.pointPath.drawPath(time);
    }
}

type Direction = 'top' | 'right' | 'bottom' | 'left';

export class ElementPoint {

    x: number;
    y: number;
    rect: DOMRect;
    direction: Direction;

    constructor(element: Element, direction: Direction) {
        const rect = element.getBoundingClientRect();
        this.rect = rect;
        this.direction = direction;
        switch (direction) {
            case 'top':
                this.x = rect.left + rect.width / 2;
                this.y = rect.top;
                break;
            case 'bottom':
                this.x = rect.left + rect.width / 2;
                this.y = rect.bottom;
                break;
            case 'right':
                this.x = rect.right;
                this.y = rect.top + rect.height / 2;
                break;
            case 'left':
                this.x = rect.left;
                this.y = rect.top + rect.height / 2;
                break;
        }
    }

    path(): [number, number] {
        return [this.x, this.y];
    }
}

