export type Locale = (typeof locales)[number];
// Supported locales: English, French, Spanish, Portuguese
export const locales = ["en", "fr", "es", "pt"] as const;
export const defaultLocale: Locale = "en";
