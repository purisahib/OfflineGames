let score=0, level=1;
let high=localStorage.getItem("highscore")||0;
let unlockedLevels = JSON.parse(localStorage.getItem("unlockedLevels")) || [true, true, true, true]; // All unlocked
let grid = Array.from({length:ROWS},()=>Array(COLS).fill(0));
let blocks=[];
let dragging=null;
let dragX = 0;
let dragY = 0;
let animations = []; // Track animations
let gameOverFlag = false; // Game over flag
let screenShake = 0; // Screen shake intensity


function saveGame(){
  localStorage.setItem("gameState", JSON.stringify({
    score, level, high, grid, blocks, currentDifficulty
  }));
}

function loadGame(){
  const data=JSON.parse(localStorage.getItem("gameState"));
  if(!data) return false;
  score=data.score; level=data.level;
  high=data.high; grid=data.grid; blocks=data.blocks;
  currentDifficulty = data.currentDifficulty || 0;
  return true;
}
function resetGame(){
  // reset basic state
  score = 0;
  level = 1;
  gameOverFlag = false;

  // clear grid
  grid = Array.from({length:ROWS},()=>Array(COLS).fill(0));

  // generate fresh blocks
  newBlocks();

  // clear saved game (progress)
  localStorage.removeItem("gameState");

  // UI update
  document.getElementById("score").innerText = score;
  document.getElementById("level").innerText = level;

  afterRestart();
}

function selectLevel(difficultyIndex){
  console.log("Selecting level:", difficultyIndex);
  
  if(!unlockedLevels[difficultyIndex]){
    alert("🔒 This level is locked! Score more to unlock!");
    return;
  }
  
  currentDifficulty = difficultyIndex;
  const diff = DIFFICULTY_LEVELS[difficultyIndex];
  
  console.log("Difficulty config:", diff);
  
  ROWS = diff.rows;
  COLS = diff.cols;
  SIZE = Math.floor(360 / COLS);
  
  console.log("Grid size:", ROWS, "x", COLS);
  
  // Reset game - FRESH START
  score = 0;
  level = 1;
  gameOverFlag = false;
  grid = Array.from({length:ROWS},()=>Array(COLS).fill(0));
  blocks = [];
  animations = [];
  
  // Hide modal and show game
  document.getElementById("levelSelectModal").style.display = "none";
  document.querySelector(".game").style.display = "block";
  
  // Resize canvas
  const boardCanvas = document.getElementById("board");
  const trayCanvas = document.getElementById("tray");
  
  console.log("Canvas before resize:", boardCanvas.width, boardCanvas.height);
  
  boardCanvas.width = COLS * SIZE;
  boardCanvas.height = ROWS * SIZE;
  trayCanvas.width = 360;
  trayCanvas.height = 120;
  
  console.log("Canvas after resize:", boardCanvas.width, boardCanvas.height);
  
  // Reset canvas context after resize
  resetCanvasContext();
  
  // Generate new blocks
  newBlocks();
  
  // Update UI
  document.getElementById("score").innerText = score;
  document.getElementById("level").innerText = level;
  
  // Redraw
  afterRestart();
  
  // Clear old game state
  localStorage.removeItem("gameState");
  
  console.log("Level selected successfully!");
}

