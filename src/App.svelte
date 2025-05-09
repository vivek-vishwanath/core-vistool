<script lang="ts">

    const pixels = Array.from({length: 32}, () =>
        Array.from({length: 32}, () => Math.random() < 0.3)
    );


    let numButtons = 4;

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

            <div class="diagram-container">
                <div class="left-column">
                    {#each Array(numButtons) as _, i}

          <div class="block pipeline">INT{numButtons - i}</div>
            {/each}
        </div>

                <div class="right-column">
                    <div class="top-right">
                        <div class="block ei">EI</div>
                        <div class="block introm">INT ROM</div>
                        <div class="block state">State</div>
                        <div class="block mainrom">Main ROM</div>
                    </div>
                    <div class="bottom-right">
                        <div class="block mar">MAR</div>
                        <div class="block ram">RAM</div>
                        <div class="block pc">PC</div>
                        <div class="block sk0">$k0</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</main>
