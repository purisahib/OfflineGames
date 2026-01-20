let board=document.getElementById("board");
let tray=document.getElementById("tray");
let ctx=board.getContext("2d");
let tctx=tray.getContext("2d");

function resetCanvasContext(){
  ctx = board.getContext("2d");
  tctx = tray.getContext("2d");
}

function drawGrid(){
  ctx.clearRect(0,0,360,360);
  for(let r=0;r<ROWS;r++)
    for(let c=0;c<COLS;c++){
      ctx.fillStyle=grid[r][c]||getComputedStyle(document.documentElement)
        .getPropertyValue('--cell');
      ctx.fillRect(c*SIZE+2,r*SIZE+2,SIZE-4,SIZE-4);
    }
}

function drawTray(){
  tctx.clearRect(0,0,360,120);
  blocks.forEach((b,i)=>{
    if(!b) return;
    
    // Calculate block bounds to center it properly
    let minR = b.shape.length, maxR = 0;
    let minC = b.shape[0].length, maxC = 0;
    
    b.shape.forEach((row,r)=>{
      row.forEach((v,c)=>{
        if(v){
          minR = Math.min(minR, r);
          maxR = Math.max(maxR, r);
          minC = Math.min(minC, c);
          maxC = Math.max(maxC, c);
        }
      });
    });
    
    let height = maxR - minR + 1;
    let width = maxC - minC + 1;
    let offsetY = (4 - height) * 10; // Center vertically in 80px space
    let offsetX = (4 - width) * 10; // Center horizontally in 80px space
    
    b.x = 40 + i*120 + offsetX;
    b.y = 40 + offsetY;
    
    b.shape.forEach((row,r)=>{
      row.forEach((v,c)=>{
        if(v){
          tctx.fillStyle=b.color;
          tctx.fillRect(b.x + (c-minC)*20, b.y + (r-minR)*20, 18, 18);
        }
      });
    });
  });
}

function drawDragging(){
  if(!dragging) return;

  ctx.globalAlpha = 0.7;
  dragging.shape.forEach((row,r)=>{
    row.forEach((v,c)=>{
      if(v){
        ctx.fillStyle = dragging.color;
        ctx.fillRect(
          dragX + c*SIZE,
          dragY + r*SIZE,
          SIZE-4,
          SIZE-4
        );
      }
    });
  });
  ctx.globalAlpha = 1;
}

function drawAnimations(){
  // Update and draw animations
  for(let i = animations.length - 1; i >= 0; i--){
    let anim = animations[i];
    anim.elapsed++;
    
    if(anim.type === "blast"){
      // Blast particle animation
      anim.vy += anim.gravity;
      anim.x += anim.vx;
      anim.y += anim.vy;
      
      let progress = anim.elapsed / anim.duration;
      let alpha = 1 - progress;
      
      ctx.globalAlpha = alpha;
      ctx.fillStyle = anim.color;
      ctx.beginPath();
      ctx.arc(anim.x, anim.y, anim.size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    if(anim.elapsed >= anim.duration){
      animations.splice(i, 1);
    }
  }
  ctx.globalAlpha = 1;
}

