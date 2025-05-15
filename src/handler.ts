import * as d3 from 'd3';
import {ElementPoint, PointPath, type Path} from "./path_painter";


function getSVG() {
    return d3.select<SVGSVGElement, unknown>("#svg-canvas");
}

export function drawElbow(from: ElementPoint, to: ElementPoint, duration: number = 1000, color: string = 'black'): Path {
    const svg = getSVG();
    if (from.direction === 'right' && to.direction === 'left' && from.x < to.x ||
        from.direction === 'left' && to.direction === 'right' && from.x > to.x) {
        const midX = (from.x + to.x) / 2
        return new PointPath(svg, [from.path(), [midX, from.y], [midX, to.y], to.path()], duration, color);
    } else if (from.direction === 'top' && to.direction === 'bottom' && from.y < to.y ||
        from.direction === 'bottom' && to.direction === 'top' && from.y > to.y) {
        const midY = (from.y + to.y) / 2
        return new PointPath(svg, [from.path(), [from.x, midY], [to.x, midY], to.path()], duration, color);
    } else if (from.direction === 'left' && to.direction !== 'left' && from.x > to.x) {
        return new PointPath(svg, [from.path(), [to.x, from.y], to.path()], duration, color);
    } else if (from.direction === 'right' && to.direction !== 'right' && from.x < to.x) {
        return new PointPath(svg, [from.path(), [to.x, from.y], to.path()], duration, color);
    } else if (from.direction === 'top' && to.direction !== 'top' && from.y > to.y) {
        return new PointPath(svg, [from.path(), [from.x, to.y], to.path()], duration, color);
    } else if (from.direction === 'bottom' && to.direction !== 'bottom' && from.y < to.y) {
        return new PointPath(svg, [from.path(), [from.x, to.y], to.path()], duration, color);
    } else if (from.direction === 'top' && to.direction === 'top') {
        const midY = Math.min(from.y, to.y) - 20;
        return new PointPath(svg, [from.path(), [from.x, midY], [to.x, midY], to.path()], duration, color);
    } else if (from.direction === 'bottom' && to.direction === 'bottom') {
        const midY = Math.max(from.y, to.y) + 20;
        return new PointPath(svg, [from.path(), [from.x, midY], [to.x, midY], to.path()], duration, color);
    } else if (from.direction === 'left' && to.direction === 'left') {
        const midX = Math.min(from.x, to.x) - 20;
        return new PointPath(svg, [from.path(), [midX, from.y], [midX, to.y], to.path()], duration, color);
    } else if (from.direction === 'right' && to.direction === 'right') {
        const midX = Math.max(from.x, to.x) + 20;
        return new PointPath(svg, [from.path(), [midX, from.y], [midX, to.y], to.path()], duration, color);
    }

    return new PointPath(svg, [[0, 0], [200, 200]], duration, color);

}
type CallbackFunction<TArgs extends any[] = any[], TResult = void> = (...args: TArgs) => TResult;

export class Callback<TArgs extends any[] = any[], TResult = void> {
    private fn: CallbackFunction<TArgs, TResult>;

    constructor(initialFn?: CallbackFunction<TArgs, TResult>) {
        this.fn = initialFn ?? (() => {}) as CallbackFunction<TArgs, TResult>;
    }

    set(callback: CallbackFunction<TArgs, TResult>) {
        this.fn = callback;
    }

    call(...args: TArgs): TResult {
        return this.fn(...args);
    }

    get function(): CallbackFunction<TArgs, TResult> {
        return this.fn;
    }
}