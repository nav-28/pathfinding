import { Grid } from './grid';

function updateGridSize(): void {
  grid.initialize(window.innerHeight / (25 * 2), window.innerWidth / 25);
}

function handleDebugButtonClick(): void {
  grid.animateNodes();
}

var grid = new Grid(window.innerHeight / (25 * 2), window.innerWidth / 25);
const container = document.getElementById('container');
const debugButton = document.createElement('button');
container?.appendChild(debugButton);
debugButton.textContent = 'Debug';
debugButton.addEventListener('click', handleDebugButtonClick);



window.addEventListener('resize', updateGridSize);
