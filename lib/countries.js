// Country and Currency Configuration

export const COUNTRIES = [
  // North Africa
  { code: "TN", name: "Tunisia", nameAr: "تونس", nameFr: "Tunisie", currency: "TND", symbol: "TND", flag: "🇹🇳" },
  { code: "DZ", name: "Algeria", nameAr: "الجزائر", nameFr: "Algérie", currency: "DZD", symbol: "DZD", flag: "🇩🇿" },
  { code: "MA", name: "Morocco", nameAr: "المغرب", nameFr: "Maroc", currency: "MAD", symbol: "MAD", flag: "🇲🇦" },
  { code: "LY", name: "Libya", nameAr: "ليبيا", nameFr: "Libye", currency: "LYD", symbol: "LYD", flag: "🇱🇾" },
  { code: "EG", name: "Egypt", nameAr: "مصر", nameFr: "Égypte", currency: "EGP", symbol: "EGP", flag: "🇪🇬" },
  
  // Europe
  { code: "FR", name: "France", nameAr: "فرنسا", nameFr: "France", currency: "EUR", symbol: "€", flag: "🇫🇷" },
  { code: "DE", name: "Germany", nameAr: "ألمانيا", nameFr: "Allemagne", currency: "EUR", symbol: "€", flag: "🇩🇪" },
  { code: "IT", name: "Italy", nameAr: "إيطاليا", nameFr: "Italie", currency: "EUR", symbol: "€", flag: "🇮🇹" },
  { code: "ES", name: "Spain", nameAr: "إسبانيا", nameFr: "Espagne", currency: "EUR", symbol: "€", flag: "🇪🇸" },
  { code: "BE", name: "Belgium", nameAr: "بلجيكا", nameFr: "Belgique", currency: "EUR", symbol: "€", flag: "🇧🇪" },
  { code: "NL", name: "Netherlands", nameAr: "هولندا", nameFr: "Pays-Bas", currency: "EUR", symbol: "€", flag: "🇳🇱" },
  { code: "GB", name: "United Kingdom", nameAr: "المملكة المتحدة", nameFr: "Royaume-Uni", currency: "GBP", symbol: "£", flag: "🇬🇧" },
  { code: "CH", name: "Switzerland", nameAr: "سويسرا", nameFr: "Suisse", currency: "CHF", symbol: "CHF", flag: "🇨🇭" },
  
  // Middle East
  { code: "SA", name: "Saudi Arabia", nameAr: "السعودية", nameFr: "Arabie Saoudite", currency: "SAR", symbol: "SAR", flag: "🇸🇦" },
  { code: "AE", name: "UAE", nameAr: "الإمارات", nameFr: "Émirats Arabes Unis", currency: "AED", symbol: "AED", flag: "🇦🇪" },
  { code: "QA", name: "Qatar", nameAr: "قطر", nameFr: "Qatar", currency: "QAR", symbol: "QAR", flag: "🇶🇦" },
  { code: "KW", name: "Kuwait", nameAr: "الكويت", nameFr: "Koweït", currency: "KWD", symbol: "KWD", flag: "🇰🇼" },
  
  // North America
  { code: "US", name: "United States", nameAr: "الولايات المتحدة", nameFr: "États-Unis", currency: "USD", symbol: "$", flag: "🇺🇸" },
  { code: "CA", name: "Canada", nameAr: "كندا", nameFr: "Canada", currency: "CAD", symbol: "CAD", flag: "🇨🇦" },
];

export const CURRENCIES = {
  TND: { code: "TND", name: "Tunisian Dinar", symbol: "TND", decimals: 3 },
  EUR: { code: "EUR", name: "Euro", symbol: "€", decimals: 2 },
  USD: { code: "USD", name: "US Dollar", symbol: "$", decimals: 2 },
  GBP: { code: "GBP", name: "British Pound", symbol: "£", decimals: 2 },
  DZD: { code: "DZD", name: "Algerian Dinar", symbol: "DZD", decimals: 2 },
  MAD: { code: "MAD", name: "Moroccan Dirham", symbol: "MAD", decimals: 2 },
  SAR: { code: "SAR", name: "Saudi Riyal", symbol: "SAR", decimals: 2 },
  AED: { code: "AED", name: "UAE Dirham", symbol: "AED", decimals: 2 },
  CAD: { code: "CAD", name: "Canadian Dollar", symbol: "CAD", decimals: 2 },
  CHF: { code: "CHF", name: "Swiss Franc", symbol: "CHF", decimals: 2 },
  EGP: { code: "EGP", name: "Egyptian Pound", symbol: "EGP", decimals: 2 },
  LYD: { code: "LYD", name: "Libyan Dinar", symbol: "LYD", decimals: 3 },
  QAR: { code: "QAR", name: "Qatari Riyal", symbol: "QAR", decimals: 2 },
  KWD: { code: "KWD", name: "Kuwaiti Dinar", symbol: "KWD", decimals: 3 },
};

export function getCountryByCode(code) {
  return COUNTRIES.find((c) => c.code === code);
}

export function getCurrencyByCode(code) {
  return CURRENCIES[code];
}

export function formatPrice(amount, currencyCode) {
  const currency = getCurrencyByCode(currencyCode);
  if (!currency) return `${amount} ${currencyCode}`;
  
  const formatted = Number(amount).toFixed(currency.decimals);
  return `${formatted} ${currency.symbol}`;
}
