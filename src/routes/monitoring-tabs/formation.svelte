<script context="module">
    export const name = 'Formasyon';
    export const priority = 2;
</script>
<script>
    //! SANIRIM KALDIRACAĞIM
    import { onMount } from "svelte";

    export let droneCount = 3;
    export let activeFormation = { name: "V", value: "v", 
        positions: 
            [
                
                { x: 100, y: 50, number: 1 },
                { x: 75, y: 100, number: 2 },
                { x: 125, y: 100, number: 3 }
            ] 
    }; // Varsayılan formasyon
    
    let createDroneElement = (id, x, y) => {
        const droneNodeWrapper = document.createElementNS("http://www.w3.org/2000/svg", 'g');
        droneNodeWrapper.setAttribute('transform', `translate(${x}, ${y})`);
        droneNodeWrapper.setAttribute('class', 'drone-node-wrapper');
        droneNodeWrapper.setAttribute('id', `drone-node-${id}`)
        const droneElement = document.createElementNS("http://www.w3.org/2000/svg", 'circle');;
        droneElement.setAttribute('r', 20);
        const droneIdElement = document.createElementNS("http://www.w3.org/2000/svg", 'text');
        droneIdElement.setAttribute('style', `-webkit-user-select: none;-ms-user-select: none;user-select: none;`);
        droneIdElement.setAttribute('text-anchor', 'middle');
        droneIdElement.setAttribute('font-size', '12');
        droneIdElement.setAttribute('fill', 'white');
        droneIdElement.setAttribute('x', "%50");
        droneIdElement.setAttribute('y', "%50");
        droneIdElement.setAttribute('dominant-baseline', 'middle');
        droneIdElement.textContent = "#"+id; // Set the text content to the drone ID

        droneNodeWrapper.appendChild(droneElement);
        droneNodeWrapper.appendChild(droneIdElement);
        return droneNodeWrapper;
    };

    onMount(() => {
        const svg = document.getElementById('activeFormation-svg');
        activeFormation.positions.forEach((position, index) => {
            const droneElement = createDroneElement(index + 1, position.x, position.y);
            svg.appendChild(droneElement);
        });
    });
</script>
<div>
    <div class="activeFormation-view-container">
        <svg id="activeFormation-svg" viewBox="0 0 200 200"></svg>
    </div>
</div>
<style>
</style>