/**
 * Presentation formatting helper for nutrition values.
 *
 * Rules:
 * - Energy: 0-1 decimal places
 * - Macronutrients (protein, fat, carbohydrates, fiber): up to 2 decimal places
 * - Micronutrients (minerals, vitamins): up to 2 decimal places
 * - Percentage: max 1 decimal place with '%'
 * - Null / undefined: '—'
 */

export function formatNutrientValue(
  value: number | null | undefined,
  nutrientCode?: string
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "—";
  }

  if (nutrientCode === "energy") {
    // Energy: 0 or 1 decimal place
    const rounded = Math.round(value * 10) / 10;
    return rounded % 1 === 0
      ? rounded.toLocaleString("id-ID")
      : rounded.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  }

  // General nutrients: max 2 decimal places, trimming trailing zeros
  const rounded = Math.round(value * 100) / 100;
  return rounded.toLocaleString("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "—";
  }

  const rounded = Math.round(value * 10) / 10;
  return `${rounded.toLocaleString("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  })}%`;
}
