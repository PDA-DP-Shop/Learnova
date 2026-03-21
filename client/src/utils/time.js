/**
 * Formats duration in minutes to a human-readable string (e.g., 1h 20m)
 * @param {number} minutes Total duration in minutes
 * @returns {string} Formatted string
 */
export const formatDuration = (minutes) => {
  if (!minutes || minutes <= 0) return '0m';
  
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  
  if (h > 0) {
    return `${h}h ${m > 0 ? `${m}m` : ''}`.trim();
  }
  return `${m}m`;
};
