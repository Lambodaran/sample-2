import { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, RefreshCw, Home } from 'lucide-react';
import { DifficultyLevel, LeaderboardEntry } from '../lib/supabase';
import { getTopScores } from '../services/leaderboardService';

interface LeaderboardScreenProps {
  playerName: string;
  finalScore: number;
  difficulty: DifficultyLevel;
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export default function LeaderboardScreen({
  playerName,
  finalScore,
  difficulty,
  onPlayAgain,
  onMainMenu,
}: LeaderboardScreenProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>(difficulty);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLeaderboard = async (diff: DifficultyLevel) => {
    setIsLoading(true);
    setError(null);

    try {
      const scores = await getTopScores(diff, 10);
      setLeaderboard(scores);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard(selectedDifficulty);
  }, [selectedDifficulty]);

  const getDifficultyColor = (diff: DifficultyLevel) => {
    switch (diff) {
      case 'easy':
        return 'bg-green-500 hover:bg-green-600';
      case 'medium':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'hard':
        return 'bg-red-500 hover:bg-red-600';
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 1:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-orange-600" />;
      default:
        return <span className="w-6 text-center font-bold text-gray-600">{index + 1}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-purple-500 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Game Over!</h1>
            <p className="text-xl text-gray-600">
              {playerName}, you scored <span className="font-bold text-purple-600">{finalScore}</span> points!
            </p>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Leaderboard</h2>
              <button
                onClick={() => loadLeaderboard(selectedDifficulty)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="flex gap-2 mb-4">
              {(['easy', 'medium', 'hard'] as DifficultyLevel[]).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold capitalize transition-all ${
                    selectedDifficulty === diff
                      ? `${getDifficultyColor(diff)} text-white shadow-lg`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-500 mx-auto" />
                  <p className="mt-4 text-gray-600">Loading leaderboard...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-600 mb-4">{error}</p>
                  <button
                    onClick={() => loadLeaderboard(selectedDifficulty)}
                    className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No scores yet for this difficulty.</p>
                  <p className="text-sm mt-2">Be the first to set a record!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((entry, index) => {
                    const isCurrentPlayer =
                      entry.player_name === playerName &&
                      entry.score === finalScore &&
                      entry.difficulty === difficulty;

                    return (
                      <div
                        key={entry.id}
                        className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${
                          isCurrentPlayer
                            ? 'bg-purple-100 border-2 border-purple-500'
                            : 'bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-center w-8">
                          {getRankIcon(index)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 truncate">
                            {entry.player_name}
                            {isCurrentPlayer && (
                              <span className="ml-2 text-xs bg-purple-500 text-white px-2 py-1 rounded-full">
                                You
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="text-xl font-bold text-gray-800">{entry.score}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={onMainMenu}
              className="bg-gray-500 text-white py-3 rounded-xl font-bold text-lg hover:bg-gray-600 transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Main Menu
            </button>
            <button
              onClick={onPlayAgain}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Play Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
