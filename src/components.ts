import {ElementPoint} from "./path_painter";
import {drawElbow} from "./handler";
import {ClockCycle, InterruptAnimation, Step} from "./animations";

export class Components {
    buttons: HTMLButtonElement[];
    intROM: HTMLElement;
    stateReg: HTMLElement;
    mainROM: HTMLElement;
    mar: HTMLElement;
    pc: HTMLElement;
    k0: HTMLElement;
    ram: HTMLElement;
    animation : InterruptAnimation[];

    constructor(buttons: HTMLButtonElement[], intROM: HTMLElement, stateReg: HTMLElement, mainROM: HTMLElement, mar: HTMLElement, pc: HTMLElement, k0: HTMLElement, ram: HTMLElement) {
        this.buttons = buttons;
        this.intROM = intROM;
        this.stateReg = stateReg;
        this.mainROM = mainROM;
        this.mar = mar;
        this.pc = pc;
        this.k0 = k0;
        this.ram = ram;
        this.animation = array(4, (i: number) => new InterruptAnimation(
            [
                new ClockCycle([
                    new Step(drawElbow(new ElementPoint(this.buttons[i], 'top'), new ElementPoint(this.intROM, 'top'), 1500, 'red')),
                    new Step(drawElbow(new ElementPoint(this.intROM, 'right'), new ElementPoint(this.stateReg, 'left'), 500, 'red'))
                ]),
                new ClockCycle([
                    new Step(drawElbow(new ElementPoint(this.stateReg, 'right'), new ElementPoint(this.mainROM, 'left'), 500, 'orange')),
                    new Step(
                        [
                            drawElbow(new ElementPoint(this.mainROM, 'bottom'), new ElementPoint(this.buttons[i], 'right'), 1000, 'orange'),
                            drawElbow(new ElementPoint(this.pc, 'right'), new ElementPoint(this.k0, 'left'), 800, 'orange')
                        ]
                    ),
                    new Step(drawElbow(new ElementPoint(this.buttons[i], 'bottom'), new ElementPoint(this.mar, 'left'), 1500, 'orange'))
                ]),
                new ClockCycle([
                    new Step(drawElbow(new ElementPoint(this.mar, 'right'), new ElementPoint(this.ram, 'left'), 500, '#91ca00')),
                    new Step(drawElbow(new ElementPoint(this.ram, 'right'), new ElementPoint(this.pc, 'left'), 500, '#91ca00'))
                ])
            ]
        ));
    }


}

function array<T>(size: number, init: (index: number) => T): T[] {
    return Array.from({ length: size }, (_, i) => init(i));
}