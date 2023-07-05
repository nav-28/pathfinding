import { Grid } from './grid';



var grid = new Grid(window.innerHeight / (25 * 2), window.innerWidth / 25);



// viz button
const playButton = document.getElementById('viz-button') as HTMLButtonElement;
playButton.addEventListener('click', () => {
  if (!grid.animationRunning) {
    grid.animateNodes()
  }
});


// speed selector
const speedSelect = document.getElementById('speed-select') as HTMLSelectElement;
speedSelect!.addEventListener('change', () => {
  const selectedSpeed = speedSelect!.value;
  if (selectedSpeed == 'slow') {
    grid.setAnimationSpeed(100);
  }
  else if (selectedSpeed == 'average') {
    grid.setAnimationSpeed(50);
  }
  else if (selectedSpeed == 'fast') {
    grid.setAnimationSpeed(20);
  }
})

function updateGridSize(): void {
  if (!grid.animationRunning) {
    grid.initialize(window.innerHeight / (25 * 2), window.innerWidth / 25);
  }
}

window.addEventListener('resize', updateGridSize);
