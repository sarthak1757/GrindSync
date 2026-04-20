export const formatDate = (value) => {
  if (!value) return 'N/A'
  return new Date(value).toLocaleDateString()
}

export const isToday = (value) => {
  const date = new Date(value)
  const now = new Date()
  return date.toDateString() === now.toDateString()
}
