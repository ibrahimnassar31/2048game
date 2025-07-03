import React from 'react';
import { Tile as TileType } from './gameLogic';

interface TileProps {
  tile: TileType | null;
  position: { row: number; col: number };
}

const Tile: React.FC<TileProps> = ({ tile, position }) => {
  if (!tile) return null;

  const tileClasses = [
    'absolute w-full h-full flex items-center justify-center rounded-lg',
    'transition-all duration-200 text-white font-bold text-2xl md:text-3xl',
    'transform select-none',
    tile.isNew ? 'scale-0 animate-[scale-in_0.2s_ease-in-out_forwards]' : '',
    tile.mergedFrom ? 'animate-[pop_0.2s_ease-in-out]' : ''
  ].join(' ');

  // Tile colors based on value
  const colorMap: Record<number, string> = {
    2: 'bg-pink-200 text-gray-800',
    4: 'bg-pink-300 text-gray-800',
    8: 'bg-orange-300 text-white',
    16: 'bg-orange-400 text-white',
    32: 'bg-red-400 text-white',
    64: 'bg-red-500 text-white',
    128: 'bg-yellow-300 text-white',
    256: 'bg-yellow-400 text-white',
    512: 'bg-green-400 text-white',
    1024: 'bg-teal-400 text-white',
    2048: 'bg-purple-500 text-white',
    4096: 'bg-indigo-500 text-white',
    8192: 'bg-blue-500 text-white',
  };

  const fontSize = 
    tile.value < 100 ? 'text-4xl' : 
    tile.value < 1000 ? 'text-3xl' : 
    tile.value < 10000 ? 'text-2xl' : 'text-xl';

  return (
    <div 
      className={`absolute transform transition-all duration-200 ease-in-out ${colorMap[tile.value] || 'bg-gray-800'} ${tileClasses} ${fontSize}`}
      style={{
        top: `calc(${position.row} * (100% / 4))`,
        left: `calc(${position.col} * (100% / 4))`,
        width: 'calc(100% / 4 - 8px)',
        height: 'calc(100% / 4 - 8px)',
        margin: '4px'
      }}
    >
      {tile.value}
      
      {/* Cute emoji decorations based on value */}
      <span className="absolute -top-1 -right-1 text-xs">
        {tile.value === 2 && '🌸'}
        {tile.value === 4 && '🌟'}
        {tile.value === 8 && '🍭'}
        {tile.value === 16 && '🍦'}
        {tile.value === 32 && '🍰'}
        {tile.value === 64 && '🧁'}
        {tile.value === 128 && '🍩'}
        {tile.value === 256 && '🌈'}
        {tile.value === 512 && '🦄'}
        {tile.value === 1024 && '💖'}
        {tile.value === 2048 && '👑'}
        {tile.value === 4096 && '✨'}
        {tile.value === 8192 && '🎉'}
      </span>
    </div>
  );
};

export default Tile;
