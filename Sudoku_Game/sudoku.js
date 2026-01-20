class Sudoku {
    constructor() {
        this.board = [];
        this.solution = [];
        this.original = [];
    }

    /**
     * Generate a random valid Sudoku puzzle
     */
    generate(difficulty = 'medium') {
        // Start with an empty board
        this.board = Array(9).fill(null).map(() => Array(9).fill(0));
        
        // Fill the diagonal 3x3 boxes
        for (let i = 0; i < 9; i += 3) {
            this.fillBox(i, i);
        }
        
        // Solve to get a complete board
        this.solve(this.board);
        
        // Copy the solution
        this.solution = this.board.map(row => [...row]);
        
        // Remove numbers based on difficulty
        const cellsToRemove = {
            easy: 35,
            medium: 45,
            hard: 55
        }[difficulty] || 45;
        
        this.removeNumbers(cellsToRemove);
        
        // Store original puzzle
        this.original = this.board.map(row => [...row]);
    }

    /**
     * Fill a 3x3 box with random numbers
     */
    fillBox(row, col) {
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
        let index = 0;
        
        for (let i = row; i < row + 3; i++) {
            for (let j = col; j < col + 3; j++) {
                this.board[i][j] = nums[index++];
            }
        }
    }

    /**
     * Solve Sudoku using backtracking
     */
    solve(board) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) {
                    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
                    
                    for (let num of nums) {
                        if (this.isValid(board, row, col, num)) {
                            board[row][col] = num;
                            
                            if (this.solve(board)) {
                                return true;
                            }
                            
                            board[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Check if a number is valid at a position
     */
    isValid(board, row, col, num) {
        // Check row, excluding the current cell
        for (let j = 0; j < 9; j++) {
            if (j !== col && board[row][j] === num) return false;
        }

        // Check column, excluding the current cell
        for (let i = 0; i < 9; i++) {
            if (i !== row && board[i][col] === num) return false;
        }

        // Check 3x3 box, excluding the current cell
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;

        for (let i = boxRow; i < boxRow + 3; i++) {
            for (let j = boxCol; j < boxCol + 3; j++) {
                if ((i !== row || j !== col) && board[i][j] === num) return false;
            }
        }

        return true;
    }

    /**
     * Remove numbers from the solution
     */
    removeNumbers(count) {
        let removed = 0;
        
        while (removed < count) {
            const row = Math.floor(Math.random() * 9);
            const col = Math.floor(Math.random() * 9);
            
            if (this.board[row][col] !== 0) {
                const temp = this.board[row][col];
                this.board[row][col] = 0;
                removed++;
            }
        }
    }

    /**
     * Check if the current board is solved correctly
     */
    isSolved(board) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const num = board[row][col];
                
                if (num === 0) return false;
                
                // Temporarily remove the number
                board[row][col] = 0;
                
                // Check if this number is valid here
                if (!this.isValid(board, row, col, num)) {
                    board[row][col] = num;
                    return false;
                }
                
                board[row][col] = num;
            }
        }
        
        return true;
    }

    /**
     * Get a hint by finding an empty cell and returning its solution
     */
    getHint(board) {
        const emptyCells = [];
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0 && this.original[row][col] === 0) {
                    emptyCells.push({ row, col });
                }
            }
        }
        
        if (emptyCells.length === 0) return null;
        
        const hint = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        hint.value = this.solution[hint.row][hint.col];
        
        return hint;
    }
}
