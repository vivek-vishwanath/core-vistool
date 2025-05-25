import type {Components} from "./components";
import {get, writable} from 'svelte/store';

export const isPaused = writable(false);

export class StateMachine {

    constructor(private components: Components) {
    }

    private interruptQueue: number[] = [];

    private currentInterrupt = -1;

    play(i: number) {
        this.components.animation[i].draw().then(_ => {
            this.currentInterrupt = -1;
            console.log("animation finished")
        });
    }

    togglePause() {
        const value = !get(isPaused);
        if (this.currentInterrupt !== -1)
            isPaused.set(value)
        if (value)  this.components.animation[this.currentInterrupt].pause();
        else        this.components.animation[this.currentInterrupt].resume();
    }

    finishStep() {
        isPaused.set(false)
        this.components.animation[this.currentInterrupt].foreach((x) => x.onPauseStep = () => {isPaused.set(true);});
        this.components.animation[this.currentInterrupt].finishStep();
    }

    finishCycle() {
        isPaused.set(false)
        this.components.animation[this.currentInterrupt].onPauseCycle = () => {isPaused.set(true);};
        this.components.animation[this.currentInterrupt].finishCycle();
    }

    dispatcher() {
        if (this.currentInterrupt !== -1) return;
        if (this.interruptQueue.length > 0) {
            this.currentInterrupt = this.interruptQueue.shift() ?? -1;
            let i = this.currentInterrupt;
            if (i !== -1) this.play(i);
        }
    }

    sendInterrupt(deviceID: number): void {
        if (!this.interruptQueue.includes(deviceID)) {
            this.interruptQueue.push(deviceID);
        }
        if (this.currentInterrupt === -1) this.dispatcher();
    }
}
