import { WeightMode } from "./nutrition.constants";
import { EffectiveWeightResult } from "./nutrition.types";

/**
 * Calculates effective edible weight based on weight mode and BDD (Bagian Dapat Dimakan).
 *
 * Mode 'edible': effectiveWeight = enteredWeight (BDD not applied).
 * Mode 'gross': effectiveWeight = enteredWeight * (bddPercent / 100).
 * If BDD is not available in gross mode, generates a warning and returns enteredWeight as fallback.
 *
 * Never returns negative or non-finite numbers.
 */
export function calculateEffectiveWeight(
  enteredWeight: number,
  weightMode: WeightMode = "edible",
  bddPercent?: number | null
): EffectiveWeightResult {
  // Guard against invalid/non-finite or negative weight
  if (!Number.isFinite(enteredWeight) || enteredWeight <= 0) {
    return {
      enteredWeight: Number.isFinite(enteredWeight) ? Math.max(0, enteredWeight) : 0,
      weightMode,
      bddPercent: bddPercent ?? null,
      effectiveWeight: 0,
      warning: enteredWeight < 0 ? "Berat makanan tidak boleh negatif." : null,
    };
  }

  if (weightMode === "edible") {
    return {
      enteredWeight,
      weightMode: "edible",
      bddPercent: bddPercent ?? null,
      effectiveWeight: enteredWeight,
      warning: null,
    };
  }

  // Gross weight mode
  if (bddPercent === null || bddPercent === undefined || !Number.isFinite(bddPercent)) {
    return {
      enteredWeight,
      weightMode: "gross",
      bddPercent: null,
      effectiveWeight: enteredWeight,
      warning: "Nilai BDD tidak tersedia untuk bahan makanan ini. Berat kotor tidak dapat dikonversi secara akurat.",
    };
  }

  // Clamp BDD between 0 and 100
  const normalizedBdd = Math.min(100, Math.max(0, bddPercent));
  const effectiveWeight = (enteredWeight * normalizedBdd) / 100;

  return {
    enteredWeight,
    weightMode: "gross",
    bddPercent: normalizedBdd,
    effectiveWeight,
    warning: null,
  };
}
