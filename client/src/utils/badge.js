export const getBadge = (points) => {
  if (points >= 120) return { name: 'Master',     emoji: '👑', color: '#7C3AED', min: 120, next: null }
  if (points >= 100) return { name: 'Expert',     emoji: '🎯', color: '#2563EB', min: 100, next: 120 }
  if (points >= 80)  return { name: 'Specialist', emoji: '⚡', color: '#0891B2', min: 80,  next: 100 }
  if (points >= 60)  return { name: 'Achiever',   emoji: '🏆', color: '#059669', min: 60,  next: 80  }
  if (points >= 40)  return { name: 'Explorer',   emoji: '🧭', color: '#D97706', min: 40,  next: 60  }
  if (points >= 20)  return { name: 'Newbie',     emoji: '🌱', color: '#6B7280', min: 20,  next: 40  }
  return { name: 'Unranked', emoji: '🔘', color: '#9CA3AF', min: 0, next: 20 }
}

export const getProgressToNextBadge = (points) => {
  const badge = getBadge(points)
  if (!badge.next) return 100
  const range = badge.next - badge.min
  const progress = points - badge.min
  return Math.round((progress / range) * 100)
}

export const BADGE_LEVELS = [
  { name: 'Newbie',     emoji: '🌱', threshold: 20,  color: '#6B7280' },
  { name: 'Explorer',   emoji: '🧭', threshold: 40,  color: '#D97706' },
  { name: 'Achiever',   emoji: '🏆', threshold: 60,  color: '#059669' },
  { name: 'Specialist', emoji: '⚡', threshold: 80,  color: '#0891B2' },
  { name: 'Expert',     emoji: '🎯', threshold: 100, color: '#2563EB' },
  { name: 'Master',     emoji: '👑', threshold: 120, color: '#7C3AED' },
]
