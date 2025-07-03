import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Undo, RefreshCw } from 'lucide-react';
import Tile from './Tile';
import { generateInitialBoard, moveBoard, Direction, GameState, undoMove } from './gameLogic';

const GameBoard: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(() => generateInitialBoard());
  const [isTouching, setIsTouching] = useState(false);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameState.over) return;

      let direction: Direction | null = null;
      switch (event.key) {
        case 'ArrowUp':
          direction = 'up';
          break;
        case 'ArrowDown':
          direction = 'down';
          break;
        case 'ArrowLeft':
          direction = 'left';
          break;
        case 'ArrowRight':
          direction = 'right';
          break;
        default:
          return;
      }

      event.preventDefault();
      setGameState(prevState => moveBoard(prevState, direction as Direction));
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.over]);

  // Handle touch input
  const handleTouchStart = (e: React.TouchEvent) => {
    if (gameState.over) return;
    
    setIsTouching(true);
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isTouching || gameState.over) return;
    
    e.preventDefault();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isTouching || gameState.over) return;
    
    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY
    };
    
    const dx = touchEnd.x - touchStart.x;
    const dy = touchEnd.y - touchStart.y;
    
    // Need significant movement to count as a swipe
    if (Math.max(Math.abs(dx), Math.abs(dy)) > 20) {
      let direction: Direction;
      
      if (Math.abs(dx) > Math.abs(dy)) {
        direction = dx > 0 ? 'right' : 'left';
      } else {
        direction = dy > 0 ? 'down' : 'up';
      }
      
      setGameState(prevState => moveBoard(prevState, direction));
    }
    
    setIsTouching(false);
  };

  // Handle button click
  const handleDirectionClick = (direction: Direction) => {
    if (gameState.over) return;
    setGameState(prevState => moveBoard(prevState, direction));
  };

  // Reset game
  const resetGame = () => {
    setGameState(generateInitialBoard());
  };

  // Undo move
  const handleUndo = () => {
    setGameState(prevState => undoMove(prevState));
  };

  return (
    <div className="max-w-md mx-auto my-8 px-4">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
          2048 Cute Edition
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Join the tiles and reach <span className="font-bold text-pink-500">2048!</span>
        </p>
      </div>

      <div className="flex justify-between mb-4">
        <div className="w-24 h-20 bg-gradient-to-br from-pink-200 to-pink-300 dark:from-pink-500 dark:to-purple-600 rounded-lg p-2 flex flex-col justify-center items-center">
          <span className="text-xs text-gray-700 dark:text-white/70 font-medium">SCORE</span>
          <span className="text-2xl font-bold text-gray-800 dark:text-white">{gameState.score}</span>
        </div>
        
        <div className="w-24 h-20 bg-gradient-to-br from-indigo-200 to-purple-300 dark:from-indigo-500 dark:to-purple-600 rounded-lg p-2 flex flex-col justify-center items-center">
          <span className="text-xs text-gray-700 dark:text-white/70 font-medium">BEST</span>
          <span className="text-2xl font-bold text-gray-800 dark:text-white">{gameState.bestScore}</span>
        </div>
      </div>

      <div className="flex space-x-2 mb-4">
        <button 
          onClick={resetGame}
          className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-red-400 to-pink-400 hover:from-red-500 hover:to-pink-500 text-white rounded-lg transition-colors duration-200 flex-1"
        >
          <RefreshCw className="w-4 h-4 mr-1" /> New Game
        </button>
        
        <button 
          onClick={handleUndo}
          disabled={gameState.history.length === 0}
          className={`flex items-center justify-center px-4 py-2 rounded-lg transition-colors duration-200 flex-1 ${
            gameState.history.length === 0 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-400 to-indigo-400 hover:from-blue-500 hover:to-indigo-500 text-white'
          }`}
        >
          <Undo className="w-4 h-4 mr-1" /> Undo
        </button>
      </div>

      <div 
        className="relative bg-pink-50 dark:bg-gray-800 rounded-lg p-2 h-80 mb-4 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Board grid */}
        <div className="absolute w-full h-full grid grid-cols-4 grid-rows-4 gap-2 p-2">
          {Array.from({ length: 16 }).map((_, index) => (
            <div key={index} className="bg-pink-100 dark:bg-gray-700 rounded-lg"></div>
          ))}
        </div>
        
        {/* Tiles */}
        <div className="absolute top-0 left-0 w-full h-full">
          {gameState.board.map((row, rowIndex) => 
            row.map((tile, colIndex) => (
              <Tile 
                key={`${rowIndex}-${colIndex}-${tile?.id || 'empty'}`}
                tile={tile}
                position={{ row: rowIndex, col: colIndex }}
              />
            ))
          )}
        </div>
        
        {/* Game over overlay */}
        {gameState.over && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center backdrop-blur-sm z-10 rounded-lg">
            <div className="text-white text-center">
              <h2 className="text-3xl font-bold mb-2">{gameState.won ? 'You Win! 🎉' : 'Game Over 😢'}</h2>
              <p className="mb-4">Final Score: {gameState.score}</p>
              <button 
                onClick={resetGame}
                className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-full text-white font-semibold transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Direction controls for mobile */}
      <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
        <div></div>
        <button 
          onClick={() => handleDirectionClick('up')}
          className="flex items-center justify-center p-3 bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white rounded-lg"
          aria-label="Move up"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
        <div></div>
        
        <button 
          onClick={() => handleDirectionClick('left')}
          className="flex items-center justify-center p-3 bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white rounded-lg"
          aria-label="Move left"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        <button 
          onClick={() => handleDirectionClick('down')}
          className="flex items-center justify-center p-3 bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white rounded-lg"
          aria-label="Move down"
        >
          <ArrowDown className="w-6 h-6" />
        </button>
        
        <button 
          onClick={() => handleDirectionClick('right')}
          className="flex items-center justify-center p-3 bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white rounded-lg"
          aria-label="Move right"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
      
      <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Use arrow keys, swipe, or buttons to move tiles</p>
        <p>When two tiles with the same number touch, they merge!</p>
      </div>
    </div>
  );
};

export default GameBoard;
