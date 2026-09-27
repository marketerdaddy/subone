export interface ScoreSubmission {
  playerId: string;
  levelNumber: number;
  score: number;
  distance: number;
  coins: number;
  durationSeconds: number;
}

export function validateRunScore(submission: ScoreSubmission): { valid: boolean; reason?: string } {
  if (submission.distance <= 0) {
    return { valid: false, reason: 'Distance must be positive' };
  }

  // Max realistic speed: 50 m/s
  const speed = submission.distance / Math.max(1, submission.durationSeconds);
  if (speed > 55) {
    return { valid: false, reason: 'Speed anomaly detected' };
  }

  // Max coins density: 2 coins per meter
  if (submission.coins > submission.distance * 2) {
    return { valid: false, reason: 'Coin density exceeds track limit' };
  }

  // Max score multiplier bounds
  const maxPossibleScore = submission.distance * 40 + submission.coins * 500;
  if (submission.score > maxPossibleScore) {
    return { valid: false, reason: 'Score exceeds physical limits' };
  }

  return { valid: true };
}
