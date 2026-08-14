// All prices are whole cents in the database (850 = EUR 8,50).
// Working with whole numbers means we never get rounding mistakes
// like 0.1 + 0.2 = 0.30000000000000004.

export function formatEuro(cents: number) {
  return "€ " + (cents / 100).toFixed(2).replace(".", ",");
}

// Turns what the user types ("8,50" or "8.50") into cents.
// Returns null when the text is not a valid price.
export function euroToCents(text: string) {
  const cleaned = text.trim().replace(",", ".");
  if (cleaned === "") return null;

  const euros = Number(cleaned);
  if (Number.isNaN(euros) || euros < 0) return null;

  return Math.round(euros * 100);
}

// Turns cents back into text for an input field ("850" -> "8.50").
export function centsToEuroText(cents: number) {
  return (cents / 100).toFixed(2);
}
