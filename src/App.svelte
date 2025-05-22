<script lang="ts">
    import {StateMachine, isPaused} from "./state_machine";
    import {onMount} from "svelte";
    import * as d3 from 'd3';
    import {Components} from "./components.js";

    const numButtons = 4;
    const buttons: HTMLButtonElement[] = [];
    let intROM: HTMLElement, mainROM: HTMLElement;
    let stateReg: HTMLElement, k0: HTMLElement, pc: HTMLElement, mar: HTMLElement;
    let ram: HTMLElement;

    const pixels = Array.from({length: 32}, () =>
        Array.from({length: 32}, () => Math.random() < 0.3)
    );

    let simulator: StateMachine;

    function sendInterrupt(i: number) {
        simulator.sendInterrupt(i);
    }

    function togglePause() {
        simulator.togglePause();
    }

    function finishStep() {
        simulator.finishStep();
    }

    function finishCycle() {
        simulator.finishCycle();
    }

    onMount(() => {
        simulator = new StateMachine(new Components(buttons, intROM, stateReg, mainROM, mar, pc, k0, ram));
        const svg = d3.select("#svg-canvas");

        svg.append("defs")
            .append("marker")
            .attr("id", "arrow")
            .attr("viewBox", "0 0 10 10")
            .attr("refX", 8)      // Match to path's end
            .attr("refY", 5)
            .attr("markerWidth", 4)
            .attr("markerHeight", 4)
            .attr("orient", "auto-start-reverse")
            .append("path")
            .attr("d", "M 0 0 L 10 5 L 0 10 z")
            .attr("fill", "black");

    });

</script>

<main>
    <div style="display: flex; padding: 1rem; gap: 1rem; background: #f3f4f6;">
        <div>
            <div style="display: flex; flex-direction: row; align-items: center; gap: 1rem;">

                <!-- Code Editor -->
                <div style="background: white; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); width: 40vw">
                    <div class="editor-tabs">
                        <div class="tab active-tab">main.s</div>
                        <div class="tab">handler.s</div>
                    </div>
                    <div style="height: 10rem; background: #f3f4f6; padding: 0.5rem; font-family: monospace; font-size: 0.875rem;">
                        ; Assembly code goes here...
                    </div>
                </div>
                <!-- Pixel Display -->
                <div class="pixel-display">
                    {#each pixels as row, i}
                        {#each row as pixel, j}
                            <div style="display: flex; flex-direction: row; align-items: center; gap: 1rem;">
                                <div class='pixel' class:green={pixel}></div>
                            </div>
                        {/each}
                    {/each}
                </div>
            </div>

            <svg id="svg-canvas"></svg>
            <div class="diagram-container">
                <div class="left-column">
                    {#each Array(numButtons) as _, i}

                        <button
                                class="block pipeline"
                                onclick={(_) => sendInterrupt(i)}
                                bind:this={buttons[i]}
                        >INT{numButtons - i}</button>
                    {/each}
                </div>

                <div class="right-column">
                    <div class="top-right">
                        <div class="block ei">EI</div>
                        <div class="block introm" bind:this={intROM}>INT ROM</div>
                        <div class="block state" bind:this={stateReg}>State</div>
                        <div class="block mainrom" bind:this={mainROM}>Main ROM</div>
                    </div>
                    <div class="bottom-right">
                        <div class="block mar" bind:this={mar}>MAR</div>
                        <div class="block ram" bind:this={ram}>RAM</div>
                        <div class="block pc" bind:this={pc}>PC</div>
                        <div class="block sk0" bind:this={k0}>$k0</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <button class="control_buttons" onclick={togglePause}>{$isPaused ? 'Play' : 'Pause'}</button>
    <button class="control_buttons" onclick={finishStep}>Finish Step</button>
    <button class="control_buttons" onclick={finishCycle}>Finish Cycle</button>
</main>
