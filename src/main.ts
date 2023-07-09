import { Grid } from "./grid";

var grid = new Grid(window.innerHeight / (25 * 2), window.innerWidth / 25);

// viz button
const playButton = document.getElementById("viz-button") as HTMLButtonElement;
playButton.addEventListener("click", () => {
  if (!grid.animationRunning) {
    grid.animateNodes();
  }
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
  }
}

function updateGridSize(): void {
  if (!grid.animationRunning) {
    grid.initialize(window.innerHeight / (25 * 2), window.innerWidth / 25);
  }
}

window.addEventListener("resize", updateGridSize);
