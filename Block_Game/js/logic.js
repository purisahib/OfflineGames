function randomBlock(){
  let availableShapes = DIFFICULTY_LEVELS[currentDifficulty].shapes;
  let shapeIndex;
  
  if(availableShapes){
    shapeIndex = availableShapes[Math.floor(Math.random() * availableShapes.length)];
  } else {
    shapeIndex = Math.floor(Math.random() * SHAPES.length);
  }
  
  return{
    shape: SHAPES[shapeIndex],
    color: Math.random()>0.5?"#4dd0ff":"#b45cff"
  };
}

function newBlocks(){
  blocks=[randomBlock(),randomBlock(),randomBlock()];
}

function canPlace(b,row,col){
  for(let r=0;r<b.shape.length;r++)
    for(let c=0;c<b.shape[0].length;c++)
      if(b.shape[r][c]){
        let rr=row+r,cc=col+c;
        if(rr>=ROWS||cc>=COLS||grid[rr][cc]) return false;
      }
  return true;
}
function allBlocksUsed(){
  return blocks.every(b => b === null);
}

function clearLines(){
  let rowsToClear = [];
  let colsToClear = [];
  
  // Check rows
  for(let r = 0; r < ROWS; r++){
    if(grid[r].every(cell => cell !== 0)){
      rowsToClear.push(r);
    }
  }
  
  // Check columns
  for(let c = 0; c < COLS; c++){
    if(grid.every(row => row[c] !== 0)){
      colsToClear.push(c);
    }
  }
  
  // Create blast animations for cleared lines
  rowsToClear.forEach(r => {
    for(let c = 0; c < COLS; c++){
      createBlastAnimation(
        c * SIZE + SIZE/2,
        r * SIZE + SIZE/2,
        grid[r][c]
      );
    }
  });
  
  colsToClear.forEach(c => {
    for(let r = 0; r < ROWS; r++){
      createBlastAnimation(
        c * SIZE + SIZE/2,
        r * SIZE + SIZE/2,
        grid[r][c]
      );
    }
  });
  
  // Screen shake when lines clear
  if(rowsToClear.length > 0 || colsToClear.length > 0){
    screenShake = 8;
  }
  
  // Remove cleared rows
  for(let r = rowsToClear.length - 1; r >= 0; r--){
    grid.splice(rowsToClear[r], 1);
    grid.unshift(Array(COLS).fill(0));
  }
  
  // Remove cleared columns
  colsToClear.forEach(c => {
    for(let r = 0; r < ROWS; r++){
      grid[r].splice(c, 1);
      grid[r].unshift(0);
    }
  });
  
  // Update score
  let rowsCleared = rowsToClear.length + colsToClear.length;
  if(rowsCleared > 0){
    score += rowsCleared * 100;
    if(score > high){
      high = score;
      localStorage.setItem("highscore", high);
      document.getElementById("high").innerText = high;
    }
    document.getElementById("score").innerText = score;
  }
}

function createBlastAnimation(x, y, color){
  for(let i = 0; i < 8; i++){
    let angle = (i / 8) * Math.PI * 2;
    let vx = Math.cos(angle) * 3;
    let vy = Math.sin(angle) * 3;
    
    animations.push({
      type: "blast",
      x: x,
      y: y,
      vx: vx,
      vy: vy,
      size: 8,
      color: color,
      duration: 30,
      elapsed: 0,
      gravity: 0.2
    });
  }
}

function canPlaceAnyBlock(){
  for(let b of blocks){
    if(!b) continue;
    for(let r = 0; r < ROWS; r++){
      for(let c = 0; c < COLS; c++){
        if(canPlace(b, r, c)){
          return true;
        }
      }
    }
  }
  return false;
}

function checkGameOver(){
  if(!canPlaceAnyBlock()){
    showGameOver();
    return true;
  }
  return false;
}

function showGameOver(){
  document.getElementById("finalScore").innerText = score;
  document.getElementById("finalHigh").innerText = high;
  document.getElementById("gameOverModal").style.display = "flex";
  gameOverFlag = true;
  
  // Unlock next level if score is high enough
  if(currentDifficulty < 3 && score > (currentDifficulty + 1) * 500){
    unlockedLevels[currentDifficulty + 1] = true;
    localStorage.setItem("unlockedLevels", JSON.stringify(unlockedLevels));
  }
}

function restartGameFromModal(){
  document.getElementById("gameOverModal").style.display = "none";
  resetGame();
}
