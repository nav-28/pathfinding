import { Grid } from "./grid";

var grid = new Grid(window.innerHeight / (25 * 2), window.innerWidth / 25);

export function runAnimation(): void {
  if (!grid.animationRunning) {
    grid.animateNodes();
  }
}

const toggleButton = document.getElementById('toggle-mode') as HTMLButtonElement;
const rootElement = document.documentElement;

toggleButton.addEventListener('click', function () {
  rootElement.classList.toggle('dark-mode');
});


// speed selector
export function changeSpeed(speed: string): void {
  const speedText = document.getElementById("speed-selection");
  if (!speedText) {
    return;
  }
  speedText.textContent = speed;
  if (speed == "Slow") {
    grid.setAnimationSpeed(100);
  } else if (speed == "Average") {
    grid.setAnimationSpeed(50);
  } else if (speed == "Fast") {
    grid.setAnimationSpeed(20);
  } else if (speed == "No Animation") {
    grid.setAnimationSpeed(0);
  }
}

function updateGridSize(): void {
  if (!grid.animationRunning) {
    grid.initialize(window.innerHeight / (25 * 2), window.innerWidth / 25);
  }
}

//window.addEventListener("resize", updateGridSize);
