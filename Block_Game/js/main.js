document.getElementById("high").innerText=high;

// Show level select modal on start
document.querySelector(".game").style.display = "none";
document.getElementById("levelSelectModal").style.display = "flex";

// Update level buttons status
function updateLevelButtons(){
  for(let i = 0; i < 4; i++){
    const btn = document.querySelector(`[data-level="${i}"]`);
    if(!unlockedLevels[i]){
      btn.style.opacity = "0.5";
      btn.style.cursor = "not-allowed";
      btn.innerHTML += "<br>🔒 Score " + ((i) * 500 + 500);
    }
  }
}
updateLevelButtons();

document.getElementById("restartBtn").onclick = () => {
  document.querySelector(".game").style.display = "none";
  document.getElementById("levelSelectModal").style.display = "flex";
  updateLevelButtons();
};

// Theme toggle
let isDarkMode = localStorage.getItem("theme") !== "light";
if(!isDarkMode) {
  document.documentElement.classList.add("light");
}

document.getElementById("themeBtn").onclick = () => {
  isDarkMode = !isDarkMode;
  if(isDarkMode){
    document.documentElement.classList.remove("light");
    localStorage.setItem("theme", "dark");
  } else {
    document.documentElement.classList.add("light");
    localStorage.setItem("theme", "light");
  }
};

if(!loadGame()) newBlocks();
function gameLoop(){
  // Apply screen shake
  if(screenShake > 0){
    let shakeX = (Math.random() - 0.5) * screenShake;
    let shakeY = (Math.random() - 0.5) * screenShake;
    ctx.save();
    ctx.translate(shakeX, shakeY);
    screenShake *= 0.9;
  }
  
  drawGrid();
  drawAnimations();
  drawTray();
  drawDragging();
  
  if(screenShake > 0){
    ctx.restore();
  }
  
  requestAnimationFrame(gameLoop);
}
function afterRestart(){
  drawGrid();
  drawTray();
}

function restartGameFromModal(){
  document.getElementById("gameOverModal").style.display = "none";
  document.querySelector(".game").style.display = "none";
  document.getElementById("levelSelectModal").style.display = "flex";
  updateLevelButtons();
}

gameLoop();
