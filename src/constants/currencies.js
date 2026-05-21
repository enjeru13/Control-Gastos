export const CURRENCIES = [
  { code: "USD", name: "Dólar estadounidense", symbol: "$", flag: "🇺🇸" },
  { code: "VES", name: "Bolívar venezolano", symbol: "Bs.", flag: "🇻🇪" },
  { code: "COP", name: "Peso colombiano", symbol: "$", flag: "🇨🇴" },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
];

export const DEFAULT_CURRENCY = "USD";

// Cambiamos Frankfurter por una API que sí soporta LATAM y CORS
export const EXCHANGE_RATE_API = "https://open.er-api.com/v6/latest/USD";
