import type {Components} from "./components";
import { writable } from 'svelte/store';
import { get } from 'svelte/store';

export const isPaused = writable(false);

export class StateMachine {

    constructor(private components: Components) {}

    private currentCycle = 0;
    private currentStep = 0;

    private interruptQueue: number[] = [];

    private currentInterrupt: number | undefined;

    pauseCondition: (...args: any[]) => boolean = () => false;

    togglePause() {
        const value = !get(isPaused);
        if (this.currentInterrupt !== undefined)
            isPaused.set(value)
        this.pauseCondition = () => value;
        const i = this.currentInterrupt ?? -1;
        if (!value && i != -1 && !this.inProgress) {
            this.pauseState = -1;
            this.animate(i);
        }
    }

    finishClockCycle() {
        isPaused.set(false);
        this.pauseCondition = (_, step) => step === 0
        const curr = this.currentInterrupt ?? -1;
        if (curr !== -1 && !this.inProgress) this.animate(curr);
    }

    dispatcher() {
        if (this.currentInterrupt !== undefined) return;
        if (this.interruptQueue.length > 0) {
            this.currentInterrupt = this.interruptQueue.shift();
            let i = this.currentInterrupt ?? -1;
            if (i !== -1) this.animate(i);
        }
    }

    sendInterrupt(deviceID: number): void {
        if (!this.interruptQueue.includes(deviceID)) {
            this.interruptQueue.push(deviceID);
            if (this.currentInterrupt === undefined) this.dispatcher();
        }
    }

    isPaused(): boolean {
        return this.pauseCondition(this.currentCycle, this.currentStep)
    }

    pauseState = -1;
    inProgress = false;

    animate(i: number) {
        if (this.currentCycle < this.components.animations.length) {
            const cycle = this.components.animations[this.currentCycle];
            const path = cycle[this.currentStep++];
            if (this.currentStep === cycle.length) {
                this.currentCycle++;
                this.currentStep = 0;
            }
            this.inProgress = true;
            path(i)?.drawPath().set(() => {
                this.inProgress = false;
                if (this.isPaused()) isPaused.set(true);
                else setTimeout(() => this.animate(i), this.currentStep === 0 ? 500 : 100)
            });
            i = this.currentInterrupt ?? -1;
        } else {
            this.currentCycle = 0;
            this.currentStep = 0;
            this.currentInterrupt = undefined;
        }
        this.dispatcher();
    }
}
