import { useState, useEffect, useCallback } from 'react';
import StartScreen from './components/StartScreen';
import GameScreen from './components/GameScreen';
import LeaderboardScreen from './components/LeaderboardScreen';
import { DifficultyLevel } from './lib/supabase';
import { submitScore } from './services/leaderboardService';

type GameState = 'start' | 'playing' | 'leaderboard';

interface GameConfig {
  playerName: string;
  difficulty: DifficultyLevel;
  finalScore: number;
}

function App() {
  const [gameState, setGameState] = useState<GameState>('start');
  const [gameConfig, setGameConfig] = useState<GameConfig>({
    playerName: '',
    difficulty: 'easy',
    finalScore: 0,
  });

  const handleStartGame = (name: string, difficulty: DifficultyLevel) => {
    setGameConfig({
      playerName: name,
      difficulty,
      finalScore: 0,
    });
    setGameState('playing');
  };

  const handleGameEnd = useCallback( async (finalScore: number) => {
    setGameConfig((prev) => ({ ...prev, finalScore }));

    try {
      await submitScore(gameConfig.playerName, finalScore, gameConfig.difficulty);
    } catch (error) {
      console.error('Failed to submit score:', error);
    }

    setGameState('leaderboard');
  }, [gameConfig.playerName, gameConfig.difficulty]);

  const handlePlayAgain = () => {
    setGameState('playing');
    setGameConfig((prev) => ({ ...prev, finalScore: 0 }));
  };

  const handleMainMenu = () => {
    setGameState('start');
    setGameConfig({
      playerName: '',
      difficulty: 'easy',
      finalScore: 0,
    });
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && gameState === 'playing') {
        const confirmQuit = window.confirm('Are you sure you want to quit? Your progress will be lost.');
        if (confirmQuit) {
          handleMainMenu();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState]);

  return (
    <>
      {gameState === 'start' && <StartScreen onStart={handleStartGame} />}
      {gameState === 'playing' && (
        <GameScreen
          playerName={gameConfig.playerName}
          difficulty={gameConfig.difficulty}
          onGameEnd={handleGameEnd}
        />
      )}
      {gameState === 'leaderboard' && (
        <LeaderboardScreen
          playerName={gameConfig.playerName}
          finalScore={gameConfig.finalScore}
          difficulty={gameConfig.difficulty}
          onPlayAgain={handlePlayAgain}
          onMainMenu={handleMainMenu}
        />
      )}
    </>
  );
}

export default App;
