import { supabase, DifficultyLevel, LeaderboardEntry } from '../lib/supabase';

export async function submitScore(
  playerName: string,
  score: number,
  difficulty: DifficultyLevel
): Promise<void> {
  const { error } = await supabase
    .from('leaderboard')
    .insert({
      player_name: playerName,
      score,
      difficulty,
    });

  if (error) {
    console.error('Error submitting score:', error);
    throw new Error('Failed to submit score');
  }
}

export async function getTopScores(
  difficulty: DifficultyLevel,
  limit: number = 10
): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .eq('difficulty', difficulty)
    .order('score', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Error fetching leaderboard:', error);
    throw new Error('Failed to load leaderboard');
  }

  return data || [];
}
