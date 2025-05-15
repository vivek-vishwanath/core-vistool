import * as d3 from 'd3';
import {Callback} from "./handler";

export abstract class Path {

    protected constructor(protected svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, undefined> ) {}

    abstract drawPath(callback: () => void): void

    abstract pause(): void

    abstract resume(): void
}

export class PointPath extends Path {

    private path: d3.Selection<SVGPathElement, unknown, HTMLElement, undefined>
    private duration: number;
    callback = new Callback(() => {});

    constructor(svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, undefined>, pathData: [number, number][], duration: number, color: string) {
        super(svg);
        const svgRect = svg.node()?.getBoundingClientRect();
        this.duration = duration;
        const line = d3.line<[number, number]>()
            .x(d => d[0] - (svgRect?.left ?? 0))
            .y(d => d[1] - (svgRect?.top ?? 0))
            .curve(d3.curveLinear);
        this.path = svg.append('path')
            .attr('d', line(pathData)!)
            .attr('stroke', color)
            .attr('stroke-width', 3)
            .attr('fill', 'none');
        const totalLength = this.path.node()?.getTotalLength() ?? 0;
        this.path
            .attr('stroke-dasharray', totalLength)
            .attr('stroke-dashoffset', totalLength)
            .attr('marker-end', null);
    }


    drawPath(callback: () => void) {
        const totalLength = (this.path.node() as SVGPathElement).getTotalLength();
        this.callback = new Callback(callback);
        this.path
            .attr('stroke-dasharray', totalLength)
            .attr('stroke-dashoffset', totalLength)
            .transition()
            .duration(this.duration)
            .ease(d3.easeLinear)
            .attr('stroke-dashoffset', 0)
            .on("end", () => { this.path.attr("marker-end", "url(#arrow)"); this.callback.function() });
    }

    pause() {
        this.path.interrupt();
    }

    resume() {
        const totalLength = this.path.node()?.getTotalLength() ?? 0;
        const currentOffset = parseFloat(this.path.attr('stroke-dashoffset'));

        const remainingRatio = currentOffset / totalLength;
        const remainingDuration = this.duration * remainingRatio;

        // Animate from current offset to 0
        this.path
            .transition()
            .duration(remainingDuration)
            .ease(d3.easeLinear)
            .attr('stroke-dashoffset', 0)
            .on("end", () => {
                this.path.attr("marker-end", "url(#arrow)");
                this.callback.function();
            });
    }
}

export class VectorPath extends Path {

    private pointPath: PointPath;

    constructor(svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, undefined>, start: [number, number], vectorData: [number, number][], duration: number, color: string) {
        super(svg);
        let pathData: [number, number][] = []
        let posX = start[0];
        let posY = start[1];
        pathData.push([posX, posY]);
        for (let i = 0; i < vectorData.length; i++) {
            posX += vectorData[i][0];
            posY += vectorData[i][1];
            pathData.push([posX, posY]);
        }
        this.pointPath = new PointPath(svg, pathData, duration, color);
    }

    drawPath(callback: () => void) {
        this.pointPath.drawPath(callback);
    }

    pause() {
        this.pointPath.pause();
    }

    resume() {
        this.pointPath.resume();
    }
}

export type Direction = 'top' | 'right' | 'bottom' | 'left';

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

