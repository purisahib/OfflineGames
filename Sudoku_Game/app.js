class SudokuGame {
    constructor() {
        this.sudoku = new Sudoku();
        this.currentBoard = [];
        this.cellNotes = []; // Store notes for each cell
        this.moveHistory = [];
        this.selectedCell = null;
        this.timeStarted = null;
        this.timerInterval = null;
        this.hintsUsed = 0;
        this.maxHints = 3;
        this.hearts = 3;
        this.notesMode = false;
        this.isMobile = window.innerWidth <= 768;
        
        this.initEventListeners();
        this.createNumberPad();
        this.startNewGame();
    }

    initEventListeners() {
        document.querySelector('.exit-btn').addEventListener('click', () => this.exitGame());
        document.getElementById('hintBtn').addEventListener('click', () => this.getHint());
        document.getElementById('undoBtn').addEventListener('click', () => this.undoMove());
        document.getElementById('eraseBtn').addEventListener('click', () => this.eraseCell());
        document.getElementById('notesBtn').addEventListener('click', () => this.toggleNoteMode());
        document.getElementById('difficulty').addEventListener('change', () => this.startNewGame());
        document.getElementById('startGameBtn').addEventListener('click', () => this.startNewGame());
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        window.addEventListener('resize', () => this.handleResize());
    }

    startNewGame() {
        this.clearTimer();
        this.hintsUsed = 0;
        this.hearts = 3;
        this.moveHistory = [];
        document.getElementById('message').textContent = '';
        
        const difficulty = document.getElementById('difficulty').value;
        this.sudoku.generate(difficulty);
        this.currentBoard = this.sudoku.board.map(row => [...row]);
        this.cellNotes = Array(9).fill(null).map(() => Array(9).fill(null).map(() => []));
        this.notesMode = false;
        this.updateHearts();
        this.timeStarted = Date.now();
        this.startTimer();
        this.renderBoard();
    }

    resetGame() {
        this.currentBoard = this.sudoku.original.map(row => [...row]);
        this.cellNotes = Array(9).fill(null).map(() => Array(9).fill(null).map(() => []));
        this.hearts = 3;
        this.moveHistory = [];
        document.getElementById('message').textContent = '';
        this.hintsUsed = 0;
        this.updateHearts();
        this.renderBoard();
    }

    exitGame() {
        if (confirm('Are you sure you want to exit?')) {
            location.reload();
        }
    }

    solveGame() {
        this.currentBoard = this.sudoku.solution.map(row => [...row]);
        this.renderBoard();
    }

    undoMove() {
        if (this.moveHistory.length > 0) {
            const lastMove = this.moveHistory.pop();
            this.currentBoard[lastMove.row][lastMove.col] = lastMove.oldValue;
            this.renderBoard();
        }
    }

    eraseCell() {
        if (this.selectedCell) {
            this.placeNumber(this.selectedCell.row, this.selectedCell.col, 0);
        }
    }

    toggleNoteMode() {
        this.notesMode = !this.notesMode;
        const btn = document.getElementById('notesBtn');
        if (this.notesMode) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    }

    updateHearts() {
        const heartsDisplay = document.getElementById('heartsDisplay');
        let hearts = '❤️ '.repeat(this.hearts);
        hearts += '🤍 '.repeat(3 - this.hearts);
        heartsDisplay.textContent = hearts;
    }

    renderBoard() {
        const board = document.getElementById('sudokuBoard');
        board.innerHTML = '';
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.id = `cell-${row}-${col}`;
                
                const value = this.currentBoard[row][col];
                
                if (value !== 0) {
                    cell.textContent = value;
                } else {
                    // Show notes if any
                    const notes = this.cellNotes[row][col];
                    if (notes && notes.length > 0) {
                        const notesDiv = document.createElement('div');
                        notesDiv.className = 'cell-notes';
                        for (let i = 1; i <= 9; i++) {
                            const noteSpan = document.createElement('div');
                            noteSpan.className = 'note';
                            if (notes.includes(i)) {
                                noteSpan.textContent = i;
                            }
                            notesDiv.appendChild(noteSpan);
                        }
                        cell.appendChild(notesDiv);
                    }
                }
                
                // Mark given cells
                if (this.sudoku.original[row][col] !== 0) {
                    cell.classList.add('given');
                }
                
                cell.addEventListener('click', () => this.selectCell(row, col));
                board.appendChild(cell);
            }
        }
    }

    selectCell(row, col) {
        // Don't select given cells
        if (this.sudoku.original[row][col] !== 0) return;
        
        // Remove previous selection
        const previousCell = document.querySelector('.cell.selected');
        if (previousCell) previousCell.classList.remove('selected');
        
        // Select new cell
        this.selectedCell = { row, col };
        const cell = document.getElementById(`cell-${row}-${col}`);
        cell.classList.add('selected');
        
        // Highlight related cells
        this.highlightRelated(row, col);
        
        // Show number pad on mobile
        if (this.isMobile) {
            this.showNumberPad();
        }
    }

    showNumberPad() {
        const pad = document.getElementById('numberPad');
        pad.classList.add('active');
        const modeSection = document.querySelector('.input-mode');
        modeSection.classList.add('active');
    }

    hideNumberPad() {
        const pad = document.getElementById('numberPad');
        pad.classList.remove('active');
        const modeSection = document.querySelector('.input-mode');
        modeSection.classList.remove('active');
    }

    setNotesMode(isNotesMode) {
        this.notesMode = isNotesMode;
        this.updateModeButtons();
    }

    updateModeButtons() {
        const numberBtn = document.getElementById('numberModeBtn');
        const notesBtn = document.getElementById('noteModeBtn');
        
        if (this.notesMode) {
            numberBtn.classList.remove('active');
            notesBtn.classList.add('active');
        } else {
            numberBtn.classList.add('active');
            notesBtn.classList.remove('active');
        }
    }

    highlightRelated(row, col) {
        // Remove previous highlights
        document.querySelectorAll('.cell.highlight, .cell.same-value').forEach(cell => {
            cell.classList.remove('highlight', 'same-value');
        });
        
        const selectedValue = this.currentBoard[row][col];
        
        // Highlight same row and column
        for (let i = 0; i < 9; i++) {
            if (i !== row) {
                const cell = document.getElementById(`cell-${i}-${col}`);
                cell.classList.add('highlight');
            }
            if (i !== col) {
                const cell = document.getElementById(`cell-${row}-${i}`);
                cell.classList.add('highlight');
            }
        }
        
        // Highlight same 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        
        for (let i = boxRow; i < boxRow + 3; i++) {
            for (let j = boxCol; j < boxCol + 3; j++) {
                if (i !== row || j !== col) {
                    const cell = document.getElementById(`cell-${i}-${j}`);
                    cell.classList.add('highlight');
                }
            }
        }
        
        // Highlight cells with same value
        if (selectedValue !== 0) {
            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                    if (this.currentBoard[i][j] === selectedValue && !(i === row && j === col)) {
                        const cell = document.getElementById(`cell-${i}-${j}`);
                        cell.classList.add('same-value');
                    }
                }
            }
        }
    }

    handleKeyPress(e) {
        if (!this.selectedCell) return;
        
        const { row, col } = this.selectedCell;
        
        // Number keys 1-9
        if (e.key >= '1' && e.key <= '9') {
            const num = parseInt(e.key);
            this.placeNumber(row, col, num);
        }
        // Delete or Backspace
        else if (e.key === 'Delete' || e.key === 'Backspace') {
            this.placeNumber(row, col, 0);
        }
        // Arrow keys
        else if (e.key === 'ArrowUp' && row > 0) {
            this.selectCell(row - 1, col);
        }
        else if (e.key === 'ArrowDown' && row < 8) {
            this.selectCell(row + 1, col);
        }
        else if (e.key === 'ArrowLeft' && col > 0) {
            this.selectCell(row, col - 1);
        }
        else if (e.key === 'ArrowRight' && col < 8) {
            this.selectCell(row, col + 1);
        }
    }

    createNumberPad() {
        const pad = document.getElementById('numberPad');
        
        for (let i = 1; i <= 9; i++) {
            const btn = document.createElement('button');
            btn.className = 'num-btn';
            btn.textContent = i;
            btn.addEventListener('click', () => {
                if (this.selectedCell) {
                    if (this.notesMode) {
                        this.toggleNote(this.selectedCell.row, this.selectedCell.col, i);
                    } else {
                        this.placeNumber(this.selectedCell.row, this.selectedCell.col, i);
                    }
                }
            });
            pad.appendChild(btn);
        }
        
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'num-btn delete';
        deleteBtn.textContent = 'Clear';
        deleteBtn.addEventListener('click', () => {
            if (this.selectedCell) {
                if (this.notesMode) {
                    this.cellNotes[this.selectedCell.row][this.selectedCell.col] = [];
                    this.renderBoard();
                    this.highlightRelated(this.selectedCell.row, this.selectedCell.col);
                } else {
                    this.placeNumber(this.selectedCell.row, this.selectedCell.col, 0);
                }
            }
        });
        pad.appendChild(deleteBtn);
    }

    toggleNote(row, col, num) {
        const notes = this.cellNotes[row][col];
        const index = notes.indexOf(num);
        
        if (index > -1) {
            notes.splice(index, 1);
        } else {
            if (this.currentBoard[row][col] === 0) {
                notes.push(num);
                notes.sort((a, b) => a - b);
            }
        }
        
        this.renderBoard();
        this.highlightRelated(row, col);
    }

    handleResize() {
        this.isMobile = window.innerWidth <= 768;
    }

    placeNumber(row, col, num) {
        if (this.sudoku.original[row][col] !== 0) return; // Can't change given cells
        
        // Save to history
        this.moveHistory.push({
            row,
            col,
            oldValue: this.currentBoard[row][col]
        });
        
        this.currentBoard[row][col] = num;
        const cell = document.getElementById(`cell-${row}-${col}`);
        cell.textContent = num === 0 ? '' : num;
        
        // Check for errors
        if (num !== 0 && !this.sudoku.isValid(this.currentBoard, row, col, num)) {
            cell.classList.add('error');
            const message = document.getElementById('message');
            message.textContent = 'Wrong move! -1 Heart';
            message.classList.add('error', 'show');
            setTimeout(() => message.classList.remove('show'), 2000);
            this.hearts--;
            this.updateHearts();
            
            if (this.hearts <= 0) {
                this.gameOver();
            }
        } else {
            cell.classList.remove('error');
            const message = document.getElementById('message');
            message.textContent = '';
            message.classList.remove('error', 'show');
        }
        
        // Check if solved
        if (num !== 0 && this.sudoku.isSolved(this.currentBoard)) {
            this.showWinMessage();
        }
        
        this.highlightRelated(row, col);
    }

    getHint() {
        if (this.hintsUsed >= this.maxHints) {
            const message = document.getElementById('message');
            message.textContent = `No more hints!`;
            message.classList.add('show');
            setTimeout(() => message.classList.remove('show'), 2000);
            return;
        }

        // Show ad before giving hint
        this.showAdForHint();
    }

    showAdForHint() {
        const message = document.getElementById('message');
        message.textContent = 'Watching ad... Please wait.';
        message.classList.add('show');

        // Simulate ad watch time (in real implementation, integrate with ad network)
        setTimeout(() => {
            message.classList.remove('show');
            this.giveHint();
        }, 3000); // 3 seconds simulation
    }

    giveHint() {
        const hint = this.sudoku.getHint(this.currentBoard);

        if (hint) {
            this.placeNumber(hint.row, hint.col, hint.value);
            this.hintsUsed++;
        } else {
            const message = document.getElementById('message');
            message.textContent = 'No more cells to hint!';
            message.classList.add('show');
            setTimeout(() => message.classList.remove('show'), 2000);
        }
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.timeStarted) / 1000);
            document.getElementById('timer').textContent = elapsed;
        }, 1000);
    }

    clearTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    showWinMessage() {
        const time = document.getElementById('timer').textContent;
        const message = document.getElementById('message');
        message.textContent = `🎉 Congratulations! Solved in ${time} seconds!`;
        message.classList.remove('error');
        message.classList.add('show');
        this.clearTimer();
    }

    gameOver() {
        const message = document.getElementById('message');
        message.textContent = '💔 Game Over! No more hearts!';
        message.classList.add('show');
        this.clearTimer();
    }

    showNumberPad() {
        const pad = document.getElementById('numberPad');
        pad.classList.add('active');
    }

    hideNumberPad() {
        const pad = document.getElementById('numberPad');
        pad.classList.remove('active');
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SudokuGame();
});
