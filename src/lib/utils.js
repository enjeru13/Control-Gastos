import { clsx } from 'clsx'

export function cn(...inputs) {
  return inputs.filter(Boolean).join(' ')
}

export function formatDate(date, fmt = 'short') {
  return new Intl.DateTimeFormat('es-VE', {
    dateStyle: fmt,
  }).format(new Date(date))
}

export function getInitials(name = '') {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}
