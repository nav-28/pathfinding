import { Grid } from "./grid";
import { tutorialContent } from './tutorial';
import { Algo } from './types';



// grid initialize

function calculateGridHeight(): number {
  const top = document.getElementById('top')?.offsetHeight;
  const footer = document.querySelector('footer')?.offsetHeight;
  const header = document.querySelector('header')?.offsetHeight;
  return window.innerHeight - top! - footer! - header!;
}

var grid = new Grid((calculateGridHeight() / 25) - 3, window.innerWidth / 25);

export function runAnimation(): void {
  if (!grid.animationRunning) {
    grid.animateNodes();
  }
}

// dark-mode toggle
const toggleButton = document.getElementById("toggle-mode") as HTMLButtonElement;
toggleButton.addEventListener("click", function () {
  document.documentElement.classList.toggle("dark-mode");
});


// algo selector
export function changeAlgo(algo: string): void {
  const algoText = document.getElementById('algo-selection');
  if (!algoText) return;
  grid.setAlgorithm(algo as Algo);
  algoText.textContent = algo;
}

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

869 - 54 - 211 - 64

// clear board
const clearBoardButton = document.getElementById('clear-board') as HTMLButtonElement;
clearBoardButton.addEventListener('click', () => {
  if (!grid.animationRunning) {
    grid.calculateSpecialNodesPosition();
    grid.initialize((calculateGridHeight() / 25) - 3, window.innerWidth / 25);
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
const tutorialDiv = document.getElementById('tutorial');
const tutSkip = document.getElementById('tutorial-skip') as HTMLButtonElement;
tutSkip.addEventListener('click', () => {
  if (!tutorialDiv) return;
  tutorialDiv.style.display = "none";
  document.body.style.pointerEvents = "auto";
  document.querySelector('main')!.style.opacity = "1";
});

const tutorialContentDiv = document.getElementById('tutorial-content') as HTMLDivElement;
const tutCounterDiv = document.getElementById('tut-count') as HTMLDivElement;
var tutorialCounter = 0;
tutorialContentDiv.innerHTML = tutorialContent[tutorialCounter];
tutCounterDiv.innerHTML = `${tutorialCounter + 1}/${tutorialContent.length}`;

const tutNextButton = document.getElementById('tutorial-next') as HTMLButtonElement;
tutNextButton.addEventListener('click', () => {
  if (tutorialCounter == tutorialContent.length - 1) {
    if (!tutorialDiv) return;
    tutorialDiv.style.display = "none";
    document.body.style.pointerEvents = "auto";
    document.querySelector('main')!.style.opacity = "1";
  }
  if (tutorialCounter < tutorialContent.length - 1) {
    tutorialCounter = tutorialCounter + 1;
    if (tutorialCounter == tutorialContent.length - 1) {
      tutNextButton.textContent = 'Finish';
    }
    changeTutorialContent();
    tutorialContentDiv.innerHTML = tutorialContent[tutorialCounter];
    tutCounterDiv.innerHTML = `${tutorialCounter + 1}/${tutorialContent.length}`;

  }
});

const tutPrevButton = document.getElementById('tutorial-prev') as HTMLButtonElement;
tutPrevButton.addEventListener('click', () => {
  if (tutorialCounter == 0) return;
  tutNextButton.textContent = 'Next';
  tutorialCounter = tutorialCounter - 1;
  changeTutorialContent();
});

const tutHelpButton = document.getElementById('tut-helper') as HTMLAnchorElement;
tutHelpButton.addEventListener('click', () => {
  if (!tutorialDiv) return;
  tutorialCounter = 0;
  tutNextButton.textContent = 'Next';
  changeTutorialContent();
  tutorialDiv.style.display = 'flex';
  document.querySelector('main')!.style.opacity = "25%";
  document.body.style.pointerEvents = "none";
});

function changeTutorialContent() {
  tutorialContentDiv.innerHTML = tutorialContent[tutorialCounter];
  tutCounterDiv.innerHTML = `${tutorialCounter + 1}/${tutorialContent.length}`;
}

// debug


// window.addEventListener("resize", updateGridSize);
// TODO:
// Deal with hover effect on mobile
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
