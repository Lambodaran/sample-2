import { useState, useEffect, useCallback } from 'react';
import { Timer, Star, Heart, XCircle, CheckCircle } from 'lucide-react';
import { DifficultyLevel } from '../lib/supabase';
import { BananaPuzzle, fetchBananaPuzzle } from '../services/bananaApi';
import LevelUpAnimation from './LevelUpAnimation';

interface GameScreenProps {
  playerName: string;
  difficulty: DifficultyLevel;
  onGameEnd: (finalScore: number) => void;
}

const DIFFICULTY_CONFIG = {
  easy: { time: 30, label: 'Easy', color: 'text-green-600' },
  medium: { time: 20, label: 'Medium', color: 'text-yellow-600' },
  hard: { time: 10, label: 'Hard', color: 'text-red-600' },
};

type FeedbackType = 'correct' | 'incorrect' | null;

export default function GameScreen({ playerName, difficulty, onGameEnd }: GameScreenProps) {
  const [puzzle, setPuzzle] = useState<BananaPuzzle | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DIFFICULTY_CONFIG[difficulty].time);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lives, setLives] = useState(3);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [feedback, setFeedback] = useState<FeedbackType>(null);

  const loadNewPuzzle = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setUserAnswer('');
    setFeedback(null);

    try {
      const newPuzzle = await fetchBananaPuzzle();
      setPuzzle(newPuzzle);
      setTimeLeft(DIFFICULTY_CONFIG[difficulty].time);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load puzzle');
    } finally {
      setIsLoading(false);
    }
  }, [difficulty]);

  useEffect(() => {
    loadNewPuzzle();
  }, [loadNewPuzzle]);

  useEffect(() => {
    if (timeLeft <= 0 || lives <= 0) {
      onGameEnd(score);
      return;
    }

    if (isLoading || showLevelUp) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setLives((l) => l - 1);
          loadNewPuzzle();
          return DIFFICULTY_CONFIG[difficulty].time;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, lives, score, difficulty, isLoading, showLevelUp, onGameEnd, loadNewPuzzle]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!puzzle || userAnswer === '') return;

    const answer = parseInt(userAnswer, 10);

    if (answer === puzzle.solution) {
      setFeedback('correct');
      const newScore = score + 1;
      setScore(newScore);

      if (newScore % 5 === 0) {
        const newLevel = Math.floor(newScore / 5) + 1;
        setCurrentLevel(newLevel);
        setShowLevelUp(true);
      }

      setTimeout(() => {
        if (!showLevelUp) {
          loadNewPuzzle();
        }
      }, 800);
    } else {
      setFeedback('incorrect');
      setLives((l) => l - 1);

      setTimeout(() => {
        loadNewPuzzle();
      }, 800);
    }
  };

  const handleLevelUpComplete = () => {
    setShowLevelUp(false);
    loadNewPuzzle();
  };

  const config = DIFFICULTY_CONFIG[difficulty];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-cyan-400 to-blue-500 flex items-center justify-center p-4">
      {showLevelUp && <LevelUpAnimation level={currentLevel} onComplete={handleLevelUpComplete} />}

      <div className="max-w-3xl w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{playerName}</h2>
              <p className={`text-sm font-semibold ${config.color}`}>{config.label} Mode</p>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500" fill="currentColor" />
                <span className="text-3xl font-bold text-gray-800">{score}</span>
              </div>

              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-6 h-6 ${i < lives ? 'text-red-500' : 'text-gray-300'}`}
                    fill={i < lives ? 'currentColor' : 'none'}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Timer className={`w-5 h-5 ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-gray-600'}`} />
                <span className={`text-2xl font-bold ${timeLeft <= 5 ? 'text-red-500' : 'text-gray-800'}`}>
                  {timeLeft}s
                </span>
              </div>
              <span className="text-sm text-gray-600">Level {currentLevel}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${
                  timeLeft <= 5 ? 'bg-red-500' : 'bg-green-500'
                }`}
                style={{ width: `${(timeLeft / config.time) * 100}%` }}
              />
            </div>
          </div>

          {error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={loadNewPuzzle}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto" />
              <p className="mt-4 text-gray-600">Loading puzzle...</p>
            </div>
          ) : puzzle ? (
            <div>
              <div className="bg-gray-100 rounded-2xl p-6 mb-6 relative overflow-hidden">
                {feedback === 'correct' && (
                  <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center animate-fadeIn">
                    <CheckCircle className="w-24 h-24 text-green-600 animate-scaleIn" />
                  </div>
                )}
                {feedback === 'incorrect' && (
                  <div className="absolute inset-0 bg-red-500 bg-opacity-20 flex items-center justify-center animate-fadeIn">
                    <XCircle className="w-24 h-24 text-red-600 animate-scaleIn" />
                  </div>
                )}

                <h3 className="text-center text-lg font-semibold text-gray-700 mb-4">
                  What number is hidden behind the banana?
                </h3>
                <div className="flex justify-center">
                  <img
                    src={puzzle.question}
                    alt="Banana puzzle"
                    className="max-w-full h-auto rounded-lg shadow-md"
                  />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="number"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Enter your answer (0-9)"
                  className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none text-2xl text-center font-bold transition-colors"
                  min="0"
                  max="9"
                  autoFocus
                  disabled={feedback !== null}
                />
                <button
                  type="submit"
                  disabled={userAnswer === '' || feedback !== null}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 rounded-xl font-bold text-xl hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100 transition-all duration-200 shadow-lg"
                >
                  Submit Answer
                </button>
              </form>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
