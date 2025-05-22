import type {Path} from "./path_painter";

export class InterruptAnimation {

    index = 0;

    cont: ((e: unknown) => void) | undefined = undefined;
    shouldPause = false;
    interrupted = false;

    onPauseCycle = () => {};

    constructor(private cycles: ClockCycle[]) {}

    foreach(lambda: (cycle: ClockCycle) => void) {
        this.cycles.forEach(lambda);
    }

    async draw() {
        for (; this.index < this.cycles.length;) {
            await this.cycles[this.index].draw();
            this.index++;
            if (this.shouldPause) {
                this.onPauseCycle();
                await new Promise(resolve => {this.cont = resolve;});
            }
        }
    }

    pause() {
        this.interrupted = true;
        this.cycles[this.index].pause();
    }

    play() {

        if (this.interrupted) {
            this.cycles[this.index].resume();
        } else {
            this.cont?.(null);
        }
    }

    resume() {
        this.play();
        this.interrupted = false;
        this.shouldPause = false;
    }

    finishCycle() {
        this.play();
        this.interrupted = false;
        this.shouldPause = true;
    }


    finishStep() {
        const cycle = this.cycles[this.index];
        if (cycle.cont === undefined && !cycle.interrupted) {
            cycle.shouldPause = true;
            this.cont?.(null);
        } else {
            cycle.finishStep();
        }
        if (cycle.shouldPause && cycle.index === cycle.length() - 1 && this.index < this.cycles.length - 1) {
            this.cycles[this.index + 1].shouldPause = true;
        }
        if (this.index == this.cycles.length - 1) {
            this.interrupted = false;
        }
        this.shouldPause = true;
    }
}

export class ClockCycle {

    index = 0;

    cont: ((e: unknown) => void) | undefined = undefined;
    shouldPause = false;
    interrupted = false;

    onPauseStep = () => {};

    constructor(private steps: Step[]) {}

    length() { return  this.steps.length; }

    async draw() {
        for (; this.index < this.steps.length;) {
            await new Promise<void>(onFinished => this.steps[this.index].play(onFinished));
            this.index++
            if (this.shouldPause) {
                this.onPauseStep();
                await new Promise(resolve => {this.cont = resolve;});
            }
        }
    }

    pause() {
        this.interrupted = true;
        this.steps[this.index].pause();
    }

    play() {
        if (this.interrupted) {
            this.steps[this.index].resume();
        } else if (this.cont) {
            this.cont?.(null);
        } else {
            throw Error(`Unable to resume step`);
        }
    }

    resume() {
        this.play();
        this.interrupted = false;
        this.shouldPause = false;
    }

    finishStep() {
        this.play();
        this.interrupted = false;
        this.shouldPause = true;
    }
}

export class Step {

    finished = 0;

    private substeps: Path[];

    constructor(substeps: Path[]);
    constructor(substep: Path);
    constructor(substeps: Path[] | Path) {
        if (Array.isArray(substeps)) {
            this.substeps = substeps;
        } else {
            this.substeps = [substeps];
        }
    }

    play(onFinished: () => void): void {
        for (let i = 0; i < this.substeps.length; i++) {
            this.substeps[i]?.drawPath(() => {
                this.finished++;
                if (this.finished === this.substeps.length) {
                    onFinished()
                }
            });
        }
    }

    pause() {
        this.substeps.forEach((substep) => substep.pause());
    }

    resume() {
        this.substeps.forEach((substep) => substep.resume());
    }

}