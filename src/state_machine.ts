import {ElementPoint, type Path} from "./path_painter";
import {drawElbow} from "./handler";

export class StateMachine {

    buttons: HTMLButtonElement[];
    intROM: HTMLElement;
    stateReg: HTMLElement;
    mainROM: HTMLElement;
    mar: HTMLElement;
    pc: HTMLElement;
    k0: HTMLElement;
    ram: HTMLElement;

    constructor(buttons: HTMLButtonElement[], intROM: HTMLElement, stateReg: HTMLElement, mainROM: HTMLElement, mar: HTMLElement, pc: HTMLElement, k0: HTMLElement, ram: HTMLElement) {
        this.buttons = buttons;
        this.intROM = intROM;
        this.stateReg = stateReg;
        this.mainROM = mainROM;
        this.mar = mar;
        this.pc = pc;
        this.k0 = k0;
        this.ram = ram;
    }

    private animations: ((a: number) => Path | null)[][] = [
        [
            (i) => drawElbow(new ElementPoint(this.buttons[i], 'top'), new ElementPoint(this.intROM, 'top'), 1500, 'red'),
            (_) => drawElbow(new ElementPoint(this.intROM, 'right'), new ElementPoint(this.stateReg, 'left'), 500, 'red'),
        ],
        [
            (_) => drawElbow(new ElementPoint(this.stateReg, 'right'), new ElementPoint(this.mainROM, 'left'), 500, 'orange'),
            (i) => drawElbow(new ElementPoint(this.mainROM, 'bottom'), new ElementPoint(this.buttons[i], 'right'), 1000, 'orange'),
            (i) => drawElbow(new ElementPoint(this.pc, 'right'), new ElementPoint(this.k0, 'left'), 800, 'orange'),
            (i) => drawElbow(new ElementPoint(this.buttons[i], 'bottom'), new ElementPoint(this.mar, 'left'), 1500, 'orange'),
        ],
        [
            (_) => drawElbow(new ElementPoint(this.mar, 'right'), new ElementPoint(this.ram, 'left'), 500, '#caa200'),
            (_) => drawElbow(new ElementPoint(this.ram, 'right'), new ElementPoint(this.pc, 'left'), 500, '#caa200'),
        ]
    ];
    private currentCycle = 0;
    private currentStep = 0;

    private interruptQueue: number[] = [];

    private currentInterrupt: number | undefined;

    dispatcher() {
        console.log("dispatcher")
        if (this.currentInterrupt !== undefined) return;
        if (this.interruptQueue.length > 0) {
            console.log("interruptQueue = " + this.interruptQueue);
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
        console.log(this.interruptQueue);
    }

    animate(i: number) {
        console.trace("animate: " + this.currentCycle)
        if (this.currentCycle < this.animations.length) {
            const cycle = this.animations[this.currentCycle];
            const path = cycle[this.currentStep++];
            if (this.currentStep === cycle.length) {
                this.currentCycle++;
                this.currentStep = 0;
            }
            path(i)?.drawPath().set(() => setTimeout(() => this.animate(i), this.currentStep === 0 ? 500 : 100));
            i = this.currentInterrupt ?? -1;
        } else {
            this.currentCycle = 0;
            this.currentStep = 0;
            this.currentInterrupt = undefined;
        }
        this.dispatcher();
    }
}
