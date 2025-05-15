import type {Path} from "./path_painter";

export class Animation {

    currentCycle = 0;

    constructor(private cycles: ClockCycle[]) {}

    play(i: number) {
        this.cycles[this.currentCycle].play(() => {
            this.currentCycle++
            if (this.currentCycle < this.cycles.length)
                setTimeout(() => this.play(i), 500);
        }, i)
    }

    pause() {
        this.cycles[this.currentCycle].pause();
    }

    resume() {
        this.cycles[this.currentCycle].resume();
    }
}

export class ClockCycle {

    currentIndex = 0;
    currentStep: Step | undefined = undefined;

    constructor(private steps: ((i: number) => Step)[]) {;
    }

    play(callBack: () => void, i: number) {
        let step = this.steps[this.currentIndex](i);
        this.currentStep = step;
        step.play(() => {
            this.currentIndex++
            if (this.currentIndex < this.steps.length)
                this.play(callBack, i);
            else
                callBack()
        })
    }

    pause() {
        this.currentStep?.pause();
    }

    resume() {
        this.currentStep?.resume();
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