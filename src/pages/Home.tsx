import React from 'react';
import Game2048 from '../components/Game2048';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-pink-50 dark:from-gray-900 dark:to-purple-900/20 pb-10">
      <header className="pt-10 pb-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
          <span className="inline-block animate-bounce mr-2">🎮</span>
          2048 Game
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">A cute version of the classic 2048 puzzle game</p>
      </header>
      
      <main>
        <Game2048 />
      </main>
      
      <footer className="mt-10 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          <span className="text-pink-500">❤</span> Made with love | {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
