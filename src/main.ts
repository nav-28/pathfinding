import { Grid } from "./grid";
import { tutorialContent } from './tutorial';

var grid = new Grid(window.innerHeight / (25 * 2), window.innerWidth / 25);

export function runAnimation(): void {
  if (!grid.animationRunning) {
    grid.animateNodes();
  }
}

const toggleButton = document.getElementById("toggle-mode") as HTMLButtonElement;

toggleButton.addEventListener("click", function () {
  document.documentElement.classList.toggle("dark-mode");
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

// clear board
const clearBoardButton = document.getElementById('clear-board') as HTMLButtonElement;
clearBoardButton.addEventListener('click', () => {
  if (!grid.animationRunning) {
    grid.calculateSpecialNodesPosition();
    grid.initialize(window.innerHeight / (25 * 2), window.innerWidth / 25);
  }
});

// clear path
const pathButton = document.getElementById('clear-path') as HTMLButtonElement;
pathButton.addEventListener('click', () => {
  if (!grid.animationRunning) {
    grid.clearPath();
  }
});

// tutorial
const tutSkip = document.getElementById('tutorial-skip') as HTMLButtonElement;
tutSkip.addEventListener('click', () => {
  const tutorialDiv = document.getElementById('tutorial');
  if (!tutorialDiv) return;
  tutorialDiv.style.display = "none";
});

const tutorialContentDiv = document.getElementById('tutorial-content') as HTMLDivElement;
const tutCounterDiv = document.getElementById('tut-count') as HTMLDivElement;
var tutorialCounter = 0;
tutorialContentDiv.innerHTML = tutorialContent[tutorialCounter];
tutCounterDiv.innerHTML = `${tutorialCounter + 1}/${tutorialContent.length}`;

const tutNextButton = document.getElementById('tutorial-next') as HTMLButtonElement;
tutNextButton.addEventListener('click', () => {
  if (tutorialCounter < tutorialContent.length - 1) {
    tutorialCounter = tutorialCounter + 1;
    tutorialContentDiv.innerHTML = tutorialContent[tutorialCounter];
    tutCounterDiv.innerHTML = `${tutorialCounter + 1}/${tutorialContent.length}`;
  }
});

const tutPrevButton = document.getElementById('tutorial-prev') as HTMLButtonElement;
tutPrevButton.addEventListener('click', () => {
  if (tutorialCounter == 0) return;
  tutorialCounter = tutorialCounter - 1;
  tutorialContentDiv.innerHTML = tutorialContent[tutorialCounter];
});

// window.addEventListener("resize", updateGridSize);
// TODO:
// Add basic buttons: clear board, clear path, clear walls
// Add Tutorial.
// Add More Algorithms
// Add Heuristics
// Add walls
// Add weights
//
// (Maybe Mazes)
//
// Algorithms:
// Uninformed Search
// BFS, DFS, Dijkstra, Bi-Bs, IDDFS,
// Informed Search uses heuristics
// A*, IA*, Bi-A*, MM, Weighted A*, Weighted IDA*
//
