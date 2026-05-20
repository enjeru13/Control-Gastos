export const SUPPORTED_CURRENCIES = ['USD', 'VES', 'COP', 'EUR']

export function formatCurrency(amount, currencyCode = 'USD') {
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatAmount(amount) {
  return new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function getCurrencySymbol(currencyCode = 'USD') {
  const symbols = { USD: '$', VES: 'Bs.', COP: '$', EUR: '€' }
  return symbols[currencyCode] ?? currencyCode
}
