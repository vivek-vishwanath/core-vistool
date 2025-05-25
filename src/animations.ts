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
            const cycle = this.cycles[this.index];
            await cycle.draw();
            this.interrupted =  false;
            this.index++;
            if (this.shouldPause && this.index < this.cycles.length) {
                this.onPauseCycle();
                await new Promise(resolve => {this.cont = resolve;});
            } else {
                await new Promise((resolve) => setTimeout(() => resolve(null), 800));
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
        this.interrupted = false;
    }

    resume() {
        this.shouldPause = false;
        if (this.cycles[this.index].resume() === -1) {
            this.play();
        }
    }

    finishCycle() {
        this.shouldPause = true;
        if (this.interrupted) {
            this.interrupted = false;
            this.cycles[this.index].shouldPause = false;
            this.cycles[this.index].play();
        }
        else this.play();
    }


    finishStep() {
        const current = this.cycles[this.index];
        if (current.finishStep() === -1) this.cont?.(null);
        // if (current.shouldPause && current.index === current.length() - 1 && this.index < this.cycles.length - 1) {
        //     this.cycles[this.index + 1].shouldPause = true;
        // }
        this.interrupted =  true;
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
            if (this.shouldPause && this.index < this.steps.length) {
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
            return -1;
        }
        this.interrupted = false;
        return 0;
    }

    resume() {
        this.shouldPause = false;
        return this.play();
    }

    finishStep() {
        this.shouldPause = true;
        return this.play();
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