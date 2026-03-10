export function calculateBandScore(score: number): number {
  if (score >= 39) return 9.0;
  if (score >= 37) return 8.5;
  if (score >= 35) return 8.0;
  if (score >= 32) return 7.5;
  if (score >= 30) return 7.0;
  if (score >= 26) return 6.5;
  if (score >= 23) return 6.0;
  if (score >= 20) return 5.5;
  if (score >= 17) return 5.0;
  if (score >= 14) return 4.5;
  if (score >= 11) return 4.0;
  if (score >= 9) return 3.5;
  if (score >= 6) return 3.0;
  return Math.max(0, score / 10);
}

export function getScoreBand(bandScore: number): string {
  if (bandScore >= 8.5) return 'Excellent';
  if (bandScore >= 7.5) return 'Very Good';
  if (bandScore >= 6.5) return 'Good';
  if (bandScore >= 5.5) return 'Satisfactory';
  if (bandScore >= 4.5) return 'Adequate';
  return 'Needs Improvement';
}
