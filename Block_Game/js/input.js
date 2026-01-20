tray.onmousedown = e=>{
  if(gameOverFlag) return;
  blocks.forEach(b=>{
    if(!b) return;
    if(
      e.offsetX > b.x &&
      e.offsetX < b.x + 80 &&
      e.offsetY > b.y &&
      e.offsetY < b.y + 80
    ){
      dragging = b;
      // Store offset from where you clicked on the block
      dragging.offsetX = e.offsetX - b.x;
      dragging.offsetY = e.offsetY - b.y;
    }
  });
};

board.onmouseup = e => {
  if(!dragging || gameOverFlag) return;

  let col = Math.floor(e.offsetX / SIZE);
  let row = Math.floor(e.offsetY / SIZE);

  // First try exact position
  if(canPlace(dragging, row, col)){
    // place block
    dragging.shape.forEach((ra,r)=>{
      ra.forEach((v,c)=>{
        if(v) grid[row+r][col+c] = dragging.color;
      });
    });

    // Create blast animations
    dragging.shape.forEach((ra,r)=>{
      ra.forEach((v,c)=>{
        if(v){
          createBlastAnimation(
            (col+c) * SIZE + SIZE/2,
            (row+r) * SIZE + SIZE/2,
            dragging.color
          );
        }
      });
    });

    // remove used block
    blocks[blocks.indexOf(dragging)] = null;
    dragging = null;

    // Check for complete lines and clear them
    clearLines();

    // 🔥 IMPORTANT FIX
    if(allBlocksUsed()){
      newBlocks();   // <-- NEW BLOCKS HERE
    }

    // Check if game is over
    checkGameOver();

    saveGame();
  } else {
    // Try to find nearby valid position (within 3x3 area)
    let bestPos = null;
    let minDistance = Infinity;

    for(let r = Math.max(0, row - 2); r <= Math.min(ROWS - 1, row + 2); r++){
      for(let c = Math.max(0, col - 2); c <= Math.min(COLS - 1, col + 2); c++){
        if(canPlace(dragging, r, c)){
          // Calculate distance from intended position
          let distance = Math.abs(r - row) + Math.abs(c - col);
          if(distance < minDistance){
            minDistance = distance;
            bestPos = {row: r, col: c};
          }
        }
      }
    }

    // Place at nearest valid position
    if(bestPos && minDistance <= 2){
      row = bestPos.row;
      col = bestPos.col;

      // place block
      dragging.shape.forEach((ra,r)=>{
        ra.forEach((v,c)=>{
          if(v && row+r < ROWS && col+c < COLS) grid[row+r][col+c] = dragging.color;
        });
      });

      // Create blast animations
      dragging.shape.forEach((ra,r)=>{
        ra.forEach((v,c)=>{
          if(v && row+r < ROWS && col+c < COLS){
            createBlastAnimation(
              (col+c) * SIZE + SIZE/2,
              (row+r) * SIZE + SIZE/2,
              dragging.color
            );
          }
        });
      });

      // remove used block
      blocks[blocks.indexOf(dragging)] = null;
      dragging = null;

      // Check for complete lines and clear them
      clearLines();

      // 🔥 IMPORTANT FIX
      if(allBlocksUsed()){
        newBlocks();   // <-- NEW BLOCKS HERE
      }

      // Check if game is over
      checkGameOver();

      saveGame();
    }
  }

  dragging = null;
};


document.addEventListener("mousemove", e=>{
  if(dragging){
    let boardRect = board.getBoundingClientRect();
    dragX = e.clientX - boardRect.left - dragging.offsetX;
    dragY = e.clientY - boardRect.top - dragging.offsetY;
  }
});

document.addEventListener("touchmove", e=>{
  if(!dragging) return;
  let rect = board.getBoundingClientRect();
  dragX = e.touches[0].clientX - rect.left - dragging.offsetX;
  dragY = e.touches[0].clientY - rect.top - dragging.offsetY;
},{passive:false});

