/**
 * Format duration in seconds to MM:SS
 */
export function formatDuration(seconds: number | null): string {
  if (!seconds || seconds <= 0) return '—';
  
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format large numbers (e.g. 1240 → "1.2K")
 */
export function formatViews(count: number): string {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M';
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K';
  }
  return count.toLocaleString();
}

/**
 * Format date to readable string
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}