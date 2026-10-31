import React, { useState, useEffect, useCallback } from 'react';
import { Monitor, User } from 'lucide-react';
import { motion } from 'motion/react';
import { GameShell } from './shared/GameShell';
import { playPop, playMatch, playGameOver, playSuccess } from './shared/soundEngine';

interface TicTacToeProps {
  onBack: () => void;
}

type Player = 'X' | 'O' | null;
type Mode = 'pvp' | 'pvc';
type Difficulty = 'easy' | 'medium' | 'hard';

export const TicTacToe: React.FC<TicTacToeProps> = ({ onBack }) => {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState<boolean>(true);
  const [mode, setMode] = useState<Mode>('pvc');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [winner, setWinner] = useState<Player | 'Draw'>(null);
  
  // Score tracking
  const [scoreX, setScoreX] = useState(0);
  const [scoreO, setScoreO] = useState(0);

  const calculateWinner = (squares: Player[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    if (!squares.includes(null)) return 'Draw';
    return null;
  };

  const minimax = (squares: Player[], depth: number, isMaximizing: boolean): number => {
    const result = calculateWinner(squares);
    if (result === 'O') return 10 - depth;
    if (result === 'X') return depth - 10;
    if (result === 'Draw') return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (!squares[i]) {
          squares[i] = 'O';
          let score = minimax(squares, depth + 1, false);
          squares[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (!squares[i]) {
          squares[i] = 'X';
          let score = minimax(squares, depth + 1, true);
          squares[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  const getComputerMove = useCallback((currentBoard: Player[]) => {
    const available = currentBoard.map((val, idx) => val === null ? idx : null).filter(val => val !== null) as number[];
    if (available.length === 0) return -1;

    // Easy: Random move
    if (difficulty === 'easy') {
      return available[Math.floor(Math.random() * available.length)];
    }
    
    // Medium: 50% chance of random, 50% best move
    if (difficulty === 'medium' && Math.random() > 0.5) {
      return available[Math.floor(Math.random() * available.length)];
    }

    // Hard/Medium-Best: Minimax
    let bestScore = -Infinity;
    let move = -1;
    for (let i = 0; i < 9; i++) {
      if (!currentBoard[i]) {
        currentBoard[i] = 'O';
        let score = minimax(currentBoard, 0, false);
        currentBoard[i] = null;
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    return move;
  }, [difficulty]);

  useEffect(() => {
    // Computer's turn
    if (mode === 'pvc' && !xIsNext && !winner) {
      const timer = setTimeout(() => {
        const move = getComputerMove([...board]);
        if (move !== -1) {
          const newBoard = [...board];
          newBoard[move] = 'O';
          setBoard(newBoard);
          setXIsNext(true);
          playMatch();
        }
      }, 400); // slight delay for realism
      return () => clearTimeout(timer);
    }
  }, [xIsNext, mode, winner, board, getComputerMove]);

  useEffect(() => {
    const w = calculateWinner(board);
    if (w) {
      setWinner(w);
      if (w === 'X') {
        setScoreX(s => s + 1);
        playSuccess();
      } else if (w === 'O') {
        setScoreO(s => s + 1);
        playGameOver();
      } else {
        playPop(); // Draw
      }
    }
  }, [board]);

  const handleClick = (i: number) => {
    if (board[i] || winner || (mode === 'pvc' && !xIsNext)) return;
    const newBoard = [...board];
    newBoard[i] = xIsNext ? 'X' : 'O';
    setBoard(newBoard);
    setXIsNext(!xIsNext);
    playPop();
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setWinner(null);
  };

  return (
    <GameShell
      title="Tic-Tac-Toe"
      onBack={onBack}
      onRestart={() => { setScoreX(0); setScoreO(0); resetGame(); }}
      instructions="Get 3 in a row to win! Choose 1 Player to play against the computer or 2 Players to play with a friend locally."
    >
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl">
        <button
          onClick={() => { setMode('pvc'); resetGame(); }}
          className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${mode === 'pvc' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-amber-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <Monitor className="w-4 h-4" /> 1 Player
        </button>
        <button
          onClick={() => { setMode('pvp'); resetGame(); }}
          className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${mode === 'pvp' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-amber-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <User className="w-4 h-4" /> 2 Players
        </button>
      </div>

      {mode === 'pvc' && (
        <div className="flex gap-2 mb-6">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map(diff => (
            <button
              key={diff}
              onClick={() => { setDifficulty(diff); resetGame(); }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${difficulty === diff ? 'bg-blue-100 text-blue-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              {diff.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-8 mb-8 w-full max-w-xs justify-between">
        <div className="text-center">
          <p className={`text-sm font-bold mb-1 ${xIsNext && !winner ? 'text-blue-600 dark:text-amber-400' : 'text-slate-500'}`}>Player X</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{scoreX}</p>
        </div>
        <div className="text-center">
          <p className={`text-sm font-bold mb-1 ${!xIsNext && !winner ? 'text-blue-600 dark:text-amber-400' : 'text-slate-500'}`}>{mode === 'pvc' ? 'Computer O' : 'Player O'}</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{scoreO}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-slate-200 dark:bg-slate-800 p-2 sm:p-3 rounded-2xl mb-8">
        {board.map((cell, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            disabled={cell !== null || winner !== null}
            className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-4xl sm:text-5xl md:text-7xl font-black shadow-sm transition-transform active:scale-95 disabled:active:scale-100"
          >
            {cell && (
              <motion.span
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={cell === 'X' ? 'text-blue-500 dark:text-amber-400' : 'text-emerald-500'}
              >
                {cell}
              </motion.span>
            )}
          </button>
        ))}
      </div>

      {winner && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          <p className="text-2xl font-black text-slate-900 dark:text-white mb-4">
            {winner === 'Draw' ? "It's a Draw!" : `${winner} Wins!`}
          </p>
          <button
            onClick={resetGame}
            className="px-6 py-3 bg-[#000080] hover:bg-blue-900 dark:bg-amber-400 dark:hover:bg-amber-500 text-white dark:text-slate-950 font-bold rounded-xl flex items-center gap-2 transition-all active:scale-95"
          >
            Play Next Round
          </button>
        </motion.div>
      )}
    </GameShell>
  );
};
