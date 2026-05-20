export const EXPENSE_CATEGORIES = [
  { id: 'food', label: 'Alimentación', icon: 'UtensilsCrossed', color: '#ef4444' },
  { id: 'transport', label: 'Transporte', icon: 'Car', color: '#f97316' },
  { id: 'housing', label: 'Vivienda', icon: 'Home', color: '#8b5cf6' },
  { id: 'health', label: 'Salud', icon: 'HeartPulse', color: '#ec4899' },
  { id: 'education', label: 'Educación', icon: 'BookOpen', color: '#3b82f6' },
  { id: 'entertainment', label: 'Entretenimiento', icon: 'Tv', color: '#14b8a6' },
  { id: 'clothing', label: 'Ropa', icon: 'ShoppingBag', color: '#a855f7' },
  { id: 'services', label: 'Servicios', icon: 'Zap', color: '#eab308' },
  { id: 'personal', label: 'Personal', icon: 'User', color: '#06b6d4' },
  { id: 'other', label: 'Otros', icon: 'MoreHorizontal', color: '#6b7280' },
]

export const INCOME_CATEGORIES = [
  { id: 'salary', label: 'Salario', icon: 'Briefcase', color: '#22c55e' },
  { id: 'freelance', label: 'Freelance', icon: 'Laptop', color: '#10b981' },
  { id: 'investment', label: 'Inversión', icon: 'TrendingUp', color: '#84cc16' },
  { id: 'gift', label: 'Regalo', icon: 'Gift', color: '#f43f5e' },
  { id: 'other_income', label: 'Otros ingresos', icon: 'PlusCircle', color: '#6b7280' },
]

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]
