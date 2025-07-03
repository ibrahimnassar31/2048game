export type Tile = {
  value: number;
  id: string;
  mergedFrom?: Tile[];
  isNew?: boolean;
}

export type Direction = 'up' | 'down' | 'left' | 'right';

export type GameState = {
  board: (Tile | null)[][];
  score: number;
  bestScore: number;
  won: boolean;
  over: boolean;
  history: {
    board: (Tile | null)[][];
    score: number;
  }[];
}

// Generate a random tile (2 or 4)
export const generateRandomTile = (board: (Tile | null)[][]): Tile => {
  const emptyPositions: { row: number; col: number }[] = [];
  
  // Find all empty positions
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (!board[row][col]) {
        emptyPositions.push({ row, col });
      }
    }
  }
  
  // Choose a random empty position
  const randomPosition = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
  
  // Create a new tile (90% chance for 2, 10% chance for 4)
  return {
    value: Math.random() < 0.9 ? 2 : 4,
    id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    isNew: true
  };
};

// Generate the initial board with two random tiles
export const generateInitialBoard = (): GameState => {
  const board: (Tile | null)[][] = Array(4).fill(null).map(() => Array(4).fill(null));
  
  // Add two random tiles
  const tile1 = generateRandomTile(board);
  board[Math.floor(Math.random() * 4)][Math.floor(Math.random() * 4)] = tile1;
  
  const tile2 = generateRandomTile(board);
  let row, col;
  do {
    row = Math.floor(Math.random() * 4);
    col = Math.floor(Math.random() * 4);
  } while (board[row][col]);
  board[row][col] = tile2;
  
  // Initialize game state
  return {
    board,
    score: 0,
    bestScore: parseInt(localStorage.getItem('bestScore') || '0', 10),
    won: false,
    over: false,
    history: []
  };
};

// Check if there are any possible moves
const hasPossibleMoves = (board: (Tile | null)[][]): boolean => {
  // Check for empty cells
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (!board[row][col]) return true;
    }
  }
  
  // Check for possible merges horizontally
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 3; col++) {
      if (board[row][col]?.value === board[row][col + 1]?.value) return true;
    }
  }
  
  // Check for possible merges vertically
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      if (board[row][col]?.value === board[row + 1][col]?.value) return true;
    }
  }
  
  return false;
};

// Clone the board
const cloneBoard = (board: (Tile | null)[][]): (Tile | null)[][] => {
  return board.map(row => row.map(tile => 
    tile ? { ...tile, mergedFrom: undefined, isNew: false } : null
  ));
};

// Rotate the board (for simplifying direction logic)
const rotateBoard = (board: (Tile | null)[][], times: number): (Tile | null)[][] => {
  let newBoard = cloneBoard(board);
  
  for (let i = 0; i < times; i++) {
    const rotated: (Tile | null)[][] = Array(4).fill(null).map(() => Array(4).fill(null));
    
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        rotated[col][3 - row] = newBoard[row][col];
      }
    }
    
    newBoard = rotated;
  }
  
  return newBoard;
};

// Move tiles in left direction (the base movement that other directions build upon)
const moveLeft = (board: (Tile | null)[][]): { board: (Tile | null)[][]; score: number } => {
  const newBoard = cloneBoard(board);
  let score = 0;
  
  for (let row = 0; row < 4; row++) {
    let tiles = newBoard[row].filter(tile => tile !== null) as Tile[];
    let newRow: (Tile | null)[] = Array(4).fill(null);
    
    // Merge tiles
    for (let i = 0; i < tiles.length - 1; i++) {
      if (tiles[i].value === tiles[i + 1]?.value) {
        const mergedValue = tiles[i].value * 2;
        tiles[i] = {
          value: mergedValue,
          id: tiles[i].id,
          mergedFrom: [tiles[i], tiles[i + 1]]
        };
        score += mergedValue;
        tiles.splice(i + 1, 1);
      }
    }
    
    // Place tiles in new row
    for (let i = 0; i < tiles.length; i++) {
      newRow[i] = tiles[i];
    }
    
    newBoard[row] = newRow;
  }
  
  return { board: newBoard, score };
};

// Move the board in the specified direction
export const moveBoard = (
  gameState: GameState,
  direction: Direction
): GameState => {
  // Save the current state to history
  const history = [
    ...gameState.history,
    {
      board: cloneBoard(gameState.board),
      score: gameState.score
    }
  ].slice(-10); // Keep last 10 moves
  
  // Determine rotation based on direction
  let rotations = 0;
  switch (direction) {
    case 'up':
      rotations = 3;
      break;
    case 'right':
      rotations = 2;
      break;
    case 'down':
      rotations = 1;
      break;
    case 'left':
    default:
      rotations = 0;
  }
  
  // Rotate board, move left, then rotate back
  let board = rotateBoard(gameState.board, rotations);
  const { board: movedBoard, score: scoreGained } = moveLeft(board);
  board = rotateBoard(movedBoard, (4 - rotations) % 4);
  
  // Check if the board actually changed
  const boardChanged = JSON.stringify(board) !== JSON.stringify(gameState.board);
  
  if (!boardChanged) {
    return gameState;
  }
  
  // Add a new random tile
  const emptyPositions: { row: number; col: number }[] = [];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (!board[row][col]) {
        emptyPositions.push({ row, col });
      }
    }
  }
  
  if (emptyPositions.length > 0) {
    const { row, col } = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
    board[row][col] = generateRandomTile(board);
  }
  
  // Update score
  const newScore = gameState.score + scoreGained;
  const bestScore = Math.max(newScore, gameState.bestScore);
  
  // Check if game is won (has a 2048 tile)
  const won = gameState.won || board.some(row => row.some(tile => tile?.value === 2048));
  
  // Check if game is over
  const over = !hasPossibleMoves(board);
  
  // Update localStorage for best score
  if (bestScore > gameState.bestScore) {
    localStorage.setItem('bestScore', bestScore.toString());
  }
  
  return {
    board,
    score: newScore,
    bestScore,
    won,
    over,
    history
  };
};

// Undo the last move
export const undoMove = (gameState: GameState): GameState => {
  if (gameState.history.length === 0) {
    return gameState;
  }
  
  const lastState = gameState.history[gameState.history.length - 1];
  return {
    ...gameState,
    board: lastState.board,
    score: lastState.score,
    history: gameState.history.slice(0, -1)
  };
};
