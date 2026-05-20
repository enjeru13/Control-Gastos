import {
  UtensilsCrossed, Car, Home, HeartPulse, BookOpen,
  Tv, ShoppingBag, Zap, User, MoreHorizontal,
  Briefcase, Laptop, TrendingUp, Gift, PlusCircle, Tag,
} from 'lucide-react'

export const ICON_MAP = {
  UtensilsCrossed,
  Car,
  Home,
  HeartPulse,
  BookOpen,
  Tv,
  ShoppingBag,
  Zap,
  User,
  MoreHorizontal,
  Briefcase,
  Laptop,
  TrendingUp,
  Gift,
  PlusCircle,
  Tag,
}

export function getIcon(name) {
  return ICON_MAP[name] ?? Tag
}
