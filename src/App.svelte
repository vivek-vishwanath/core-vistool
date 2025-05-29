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

    // const pixels = Array.from({length: 32}, () =>
    //     Array.from({length: 32}, () => Math.random() < 0.3)
    // );

    let isHovered = false;

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
                <div style="background: white; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); width: 100%">
                    <div class="editor-tabs">
                        <div class="tab">main.s</div>
                        <div class="tab active-tab">handler.s</div>
                    </div>
                    <div class="code-editor">
                        push $k0&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;;
                        Save return address to stack<br>
                        ei&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;;
                        Re-enable interrupts<br>
                        <br>
                        push $a0&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;;
                        Save processor registers to stack<br>
                        push $a1&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;;
                        ...<br>
                        ... <br>
                        push $t2&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;;
                        ...<br>
                        <br>
                        lea $t0, DIRECTION&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;; Get the pointer to the direction
                        variable<br>
                        in $t1&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;;
                        Poll the device to check the new direction<br>
                        sw $t1, 0($t0)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;; Update the
                        new direction<br>
                        <br>
                        pop $a0&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;;
                        Restore processor registers from stack<br>
                        pop $a1&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;;
                        ...<br>
                        ... <br>
                        pop $t2&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;;
                        ...<br>
                        <br>
                        ei&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;;
                        Disable interrupts<br>
                        pop $k0&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;;
                        Restore return address from stack <br>
                        reti&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;;
                        Return & enable interrupts atomically <br>
                    </div>
                </div>
                <!-- Pixel Display -->
                <!--                <div class="pixel-display">-->
                <!--                    {#each pixels as row, i}-->
                <!--                        {#each row as pixel, j}-->
                <!--                            <div style="display: flex; flex-direction: row; align-items: center; gap: 1rem;">-->
                <!--                                <div class='pixel' class:green={pixel}></div>-->
                <!--                            </div>-->
                <!--                        {/each}-->
                <!--                    {/each}-->
                <!--                </div>-->
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
    <div class="tooltip-container">
        {#if isHovered}
            <div class="tooltip-box">
                <div style="font-size: 18px">Core Visualization Tool</div>
                <hr/>
                <div class="app-details">
                    <p><strong>Version:</strong> v0.1.0</p>
                    <p><strong>Interaction:</strong> Click the INT buttons to simulate an interrupt</p>
                    <p><strong>New Features:</strong> Playback control</p>
                    <p><strong>Upcoming:</strong> Handler code step-through</p>
                </div>
            </div>
        {/if}
        <div class="circle"
             style="background-color: transparent; width: 48px; height: 48px;"
             role="presentation"
             onmouseenter={() => {isHovered = true;}}
             onmouseleave={() => {isHovered = false;}}>
            <div class="circle">i</div>

        </div>
    </div>
</main>
