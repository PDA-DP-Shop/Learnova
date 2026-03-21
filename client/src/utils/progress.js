export const calcCompletionPercent = (completedLessons, totalLessons) => {
  if (!totalLessons || totalLessons === 0) return 0
  return Math.round((completedLessons / totalLessons) * 100)
}

export const formatDuration = (minutes) => {
  if (!minutes) return '–'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  return `${h}h ${m}m`
}

export const formatDate = (dateStr) => {
  if (!dateStr) return '–'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export const getStatusColor = (status) => {
  switch (status) {
    case 'COMPLETED': return 'badge-green'
    case 'IN_PROGRESS': return 'badge-indigo'
    case 'YET_TO_START': return 'badge-slate'
    default: return 'badge-slate'
  }
}

export const getStatusLabel = (status) => {
  switch (status) {
    case 'COMPLETED':    return 'Completed'
    case 'IN_PROGRESS':  return 'In Progress'
    case 'YET_TO_START': return 'Yet to Start'
    default: return status
  }
}
