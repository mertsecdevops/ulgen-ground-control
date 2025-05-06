<script context="module">
    export const name = 'Terminal';
    export const priority = 4;
    export const isVisible = true;
</script>
<div class="terminal-output">
    <div class="terminal-header">
        <span>Sürü Terminali</span>
    </div>
    <div id="terminal-log" class="terminal-log">
    </div>
</div>
<style>
    /* Terminal Styles */
    .terminal-output {
        background-color: #000;
        color: #0f0;
        font-family: 'Space Mono', monospace;
        height: 100%;
        display: flex;
        flex-direction: column;
        border-radius: 4px;
        overflow: hidden;
    }
    
    .terminal-header {
        background-color: #333;
        color: #fff;
        padding: 5px;
        text-align: center;
        font-weight: bold;
    }
    
    .terminal-log {
        flex-grow: 1;
        overflow-y: auto;
        padding: 10px;
        font-size: 11px;
        line-height: 1.4;
    }
    
    .log-entry {
        margin-bottom: 5px;
        word-wrap: break-word;
    }
    
    .log-entry.error {
        color: #f00;
    }
    
    .log-entry.warning {
        color: #ff0;
    }
    
    .log-entry.success {
        color: #0f0;
    }
</style>