const ROWS = 6;
const COLS = 7;
const DEPTH = 5;

let board = [];
let currentPlayer = "blue";
let gameOver = false;
let gameMode = "bot"; // "bot" or "player"

let playerScore = Number(localStorage.getItem("playerScore")) || 0;
let botScore = Number(localStorage.getItem("botScore")) || 0;
let player2Score = Number(localStorage.getItem("player2Score")) || 0;
let playerName = "Player 1";
let player2Name = "Player 2";
let winningCells = [];

const boardDiv = document.getElementById("board");
const statusText = document.getElementById("status");
const diffSelect = document.getElementById("difficulty");
const modeSelect = document.getElementById("gameMode");

const dropSound = document.getElementById("dropSound");
const winSound = document.getElementById("winSound");

const resultShowTime = 1000; // ms

modeSelect.addEventListener("change", (e) => {
  gameMode = e.target.value;
  if (gameMode === "player") {
    diffSelect.style.display = "none";
  } else {
    diffSelect.style.display = "block";
  }
  resetGame();
});

function vibrate(ms) {
  if (navigator.vibrate) navigator.vibrate(ms);
}

function createBoard() {
  board = [];
  boardDiv.innerHTML = "";
  gameOver = false;
  currentPlayer = "blue";
  winningCells = [];
  updateStatus();

  for (let r = 0; r < ROWS; r++) {
    board[r] = [];
    for (let c = 0; c < COLS; c++) {
      board[r][c] = "";
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.id = `cell-${r}-${c}`;
      cell.onclick = () => playerMove(c);
      boardDiv.appendChild(cell);
    }
  }
}

function updateStatus() {
  if (gameMode === "bot") {
    statusText.innerText = currentPlayer === "blue" ? "You 🔵 Turn" : "🤖 BOT Turn";
  } else {
    statusText.innerText = currentPlayer === "blue" ? playerName + " 🔵 Turn" : player2Name + " 🔴 Turn";
  }
}

function playerMove(col) {
  if (gameOver) return;
  if (gameMode === "bot" && currentPlayer !== "blue") return;
  makeMove(col, currentPlayer);
  if (!gameOver && gameMode === "bot") setTimeout(botMove, 450);
}

function makeMove(col, player) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === "") {
      board[r][col] = player;
      renderDisc(r, col, player);
      dropSound.currentTime = 0;
      dropSound.play();
      vibrate(30);

      if (checkWin(board)) {
        gameOver = true;
        highlightWin(board);
        winSound.play();
        vibrate([100, 50, 100]);

        if (gameMode === "bot") {
          if (player === "blue") {
            setTimeout(() => showResultPopup("🎉 YOU WIN!", "You defeated the BOT! 🤖"), resultShowTime);
            playerScore += 10;
          } else {
            setTimeout(() => showResultPopup("🤖 BOT WINS!", "Better luck next time! 💪"), resultShowTime);
            botScore += 10;
          }
          saveScores();
        } else {
          if (player === "blue") {
            setTimeout(() => showResultPopup("🎉 PLAYER 1 WINS!", "Player 1 (🔵) wins! 🎊"), resultShowTime);
            playerScore += 10;
          } else {
            setTimeout(() => showResultPopup("🎉 PLAYER 2 WINS!", "Player 2 (🔴) wins! 🎊"), resultShowTime);
            player2Score += 10;
          }
          savePlayer2Scores();
        }
        updateLeaderboard();
        return;
      }

      if (isDraw()) {
        statusText.innerText = "😐 DRAW!";
        if (gameMode === "bot") {
          playerScore += 5;
          botScore += 5;
          saveScores();
        } else {
          playerScore += 5;
          player2Score += 5;
          savePlayer2Scores();
        }
        showResultPopup("😐 DRAW!", "It's a tie! Well played!");
        updateLeaderboard();
        gameOver = true;
        return;
      }

      currentPlayer = player === "blue" ? "red" : "blue";
      updateStatus();
      break;
    }
  }
}

function renderDisc(r, c, player) {
  const boardRect = boardDiv.getBoundingClientRect();
  const cell = boardDiv.children[r * COLS + c];
  const cellRect = cell.getBoundingClientRect();
  
  // Get top cell position
  const topCell = boardDiv.children[0 * COLS + c];
  const topCellRect = topCell.getBoundingClientRect();
  
  // Create falling disc
  const disc = document.createElement("div");
  disc.className = `disc ${player} falling`;
  disc.style.left = (topCellRect.left - boardRect.left + boardRect.left) + "px";
  disc.style.top = (topCellRect.top - boardRect.top + boardRect.top) + "px";
  
  // Calculate fall distance
  const fallDistance = cellRect.top - topCellRect.top;
  disc.style.setProperty("--fall-distance", fallDistance + "px");
  
  document.body.appendChild(disc);
  
  // Remove falling disc and add static disc to cell
  disc.addEventListener("animationend", () => {
    document.body.removeChild(disc);
    
    // Add final static disc
    const finalDisc = document.createElement("div");
    finalDisc.className = `disc ${player}`;
    finalDisc.style.animation = "none";
    finalDisc.style.position = "absolute";
    finalDisc.style.top = "0";
    finalDisc.style.left = "0";
    finalDisc.style.pointerEvents = "auto";
    cell.appendChild(finalDisc);
  }, { once: true });
}

/* 🤖 BOT */
function botMove() {
  let level = diffSelect.value;
  let col =
    level === "easy" ? randomMove() :
    level === "medium" ? mediumMove() :
    hardMove();
  makeMove(col, "red");
}

function randomMove() {
  let cols = [];
  for (let c = 0; c < COLS; c++) if (getRow(c) !== -1) cols.push(c);
  return cols[Math.floor(Math.random() * cols.length)];
}

function mediumMove() {
  return getWinningMove("red") ?? getWinningMove("blue") ?? randomMove();
}

function hardMove() {
  let bestScore = -Infinity, bestCol = 0;
  for (let c = 0; c < COLS; c++) {
    let r = getRow(c);
    if (r !== -1) {
      board[r][c] = "red";
      let score = minimax(board, DEPTH, false, -Infinity, Infinity);
      board[r][c] = "";
      if (score > bestScore) {
        bestScore = score;
        bestCol = c;
      }
    }
  }
  return bestCol;
}

function minimax(b, depth, max, alpha, beta) {
  if (depth === 0 || checkWin(b)) return evaluate(b);
  if (max) {
    let v = -Infinity;
    for (let c = 0; c < COLS; c++) {
      let r = getRow(c);
      if (r !== -1) {
        b[r][c] = "red";
        v = Math.max(v, minimax(b, depth - 1, false, alpha, beta));
        b[r][c] = "";
        alpha = Math.max(alpha, v);
        if (beta <= alpha) break;
      }
    }
    return v;
  } else {
    let v = Infinity;
    for (let c = 0; c < COLS; c++) {
      let r = getRow(c);
      if (r !== -1) {
        b[r][c] = "blue";
        v = Math.min(v, minimax(b, depth - 1, true, alpha, beta));
        b[r][c] = "";
        beta = Math.min(beta, v);
        if (beta <= alpha) break;
      }
    }
    return v;
  }
}

function evaluate(b) {
  let score = 0;
  let center = Math.floor(COLS / 2);
  for (let r = 0; r < ROWS; r++)
    if (b[r][center] === "red") score += 3;
  return score;
}

function getWinningMove(player) {
  for (let c = 0; c < COLS; c++) {
    let r = getRow(c);
    if (r !== -1) {
      board[r][c] = player;
      if (checkWin(board)) {
        board[r][c] = "";
        return c;
      }
      board[r][c] = "";
    }
  }
  return null;
}

function getRow(col) {
  for (let r = ROWS - 1; r >= 0; r--)
    if (board[r][col] === "") return r;
  return -1;
}

function checkWin(b) {
  const d = [[1,0],[0,1],[1,1],[1,-1]];
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      for (let [dr,dc] of d)
        if (b[r][c] && [...Array(4)].every((_,i)=>{
          let nr=r+dr*i,nc=c+dc*i;
          return b[nr]?.[nc]===b[r][c];
        })) {
          winningCells = [...Array(4)].map((_,i)=>({
            r: r+dr*i,
            c: c+dc*i
          }));
          return true;
        }
  return false;
}

function highlightWin(b) {
  if (winningCells.length < 4) return;
  
  // Get the actual cell elements
  const firstCell = boardDiv.children[winningCells[0].r * COLS + winningCells[0].c];
  const lastCell = boardDiv.children[winningCells[3].r * COLS + winningCells[3].c];
  
  // Get center positions of the cells
  const firstRect = firstCell.getBoundingClientRect();
  const lastRect = lastCell.getBoundingClientRect();
  
  const x1 = firstRect.left + firstRect.width / 2;
  const y1 = firstRect.top + firstRect.height / 2;
  const x2 = lastRect.left + lastRect.width / 2;
  const y2 = lastRect.top + lastRect.height / 2;
  
  // Create SVG line
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("style", "position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 999;");
  
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", x1);
  line.setAttribute("y1", y1);
  line.setAttribute("x2", x2);
  line.setAttribute("y2", y2);
  line.setAttribute("stroke", "#ffff00");
  line.setAttribute("stroke-width", "6");
  line.setAttribute("stroke-linecap", "round");
  line.setAttribute("filter", "drop-shadow(0 0 8px #ffff00)");
  
  svg.appendChild(line);
  document.body.appendChild(svg);
  
  // Keep the line visible for 3 seconds before popup shows
  setTimeout(() => {
    if (svg.parentNode) {
      document.body.removeChild(svg);
    }
  }, 3000);
}

function isDraw() {
  return board.flat().every(c => c !== "");
}

/* SCORE + LEADERBOARD */
function saveScores() {
  localStorage.setItem("playerScore", playerScore);
  localStorage.setItem("botScore", botScore);
  document.getElementById("playerScore").innerText = playerScore;
  document.getElementById("botScore").innerText = botScore;
}

function savePlayer2Scores() {
  localStorage.setItem("playerScore", playerScore);
  localStorage.setItem("player2Score", player2Score);
  document.getElementById("playerScore").innerText = playerScore;
  document.getElementById("botScore").innerText = player2Score;
}

function updateLeaderboard() {
  let data = JSON.parse(localStorage.getItem("leaderboard")) || [];
  data.push({ name: playerName, score: playerScore });
  data.sort((a,b)=>b.score-a.score);
  data = data.slice(0,5);
  localStorage.setItem("leaderboard", JSON.stringify(data));
  renderLeaderboard();
}

function renderLeaderboard() {
  const list = document.getElementById("leaderList");
  list.innerHTML = "";
  let data = JSON.parse(localStorage.getItem("leaderboard")) || [];
  data.forEach(p => {
    let li = document.createElement("li");
    li.innerText = `${p.name} — ${p.score}`;
    list.appendChild(li);
  });
}

function resetGame() {
  createBoard();
}

function showResultPopup(title, message) {
  const popup = document.getElementById("resultPopup");
  const titleEl = document.getElementById("resultTitle");
  const messageEl = document.getElementById("resultMessage");
  
  titleEl.innerText = title;
  messageEl.innerText = message;
  popup.classList.remove("hidden");
}

function closeResultPopup() {
  const popup = document.getElementById("resultPopup");
  popup.classList.add("hidden");
  resetGame();
}

// Initialize game based on mode
function initGame() {
  if (gameMode === "bot") {
    saveScores();
    const opponent = document.getElementById("opponent");
    opponent.innerHTML = "🤖 <span id='botScore'>" + botScore + "</span>";
  } else {
    savePlayer2Scores();
    const opponent = document.getElementById("opponent");
    opponent.innerHTML = player2Name + " 🔴 <span id='botScore'>" + player2Score + "</span>";
  }
  renderLeaderboard();
  createBoard();
}

initGame();
