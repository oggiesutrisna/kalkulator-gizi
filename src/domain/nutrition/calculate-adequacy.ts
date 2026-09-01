import { TKPI_NUTRIENTS } from "./nutrition.constants";
import { NutrientAdequacy } from "./nutrition.types";

/**
 * MVP domain rule — must be validated by nutrition expert before clinical use.
 *
 * Calculates intake adequacy percentage:
 * percentage = (totalIntake / targetRequirement) * 100
 *
 * If targetRequirement is 0, null, undefined, negative, or non-finite: returns null.
 * If totalIntake is null, undefined, or non-finite: returns null.
 * Never produces NaN, Infinity, or -Infinity.
 */
export function calculateAdequacyPercentage(
  totalIntake: number | null | undefined,
  targetRequirement: number | null | undefined
): number | null {
  if (
    targetRequirement === null ||
    targetRequirement === undefined ||
    !Number.isFinite(targetRequirement) ||
    targetRequirement <= 0 ||
    totalIntake === null ||
    totalIntake === undefined ||
    !Number.isFinite(totalIntake)
  ) {
    return null;
  }

  const pct = (totalIntake / targetRequirement) * 100;
  return Number.isFinite(pct) ? pct : null;
}

/**
 * Computes adequacy data for all TKPI nutrients given intake totals and user targets.
 */
export function calculateAllNutrientAdequacies(
  dailyTotals: Record<string, number | null>,
  targets: Record<string, number | null | undefined>
): Record<string, NutrientAdequacy> {
  const result: Record<string, NutrientAdequacy> = {};

  for (const nDef of TKPI_NUTRIENTS) {
    const intake = dailyTotals[nDef.code] ?? null;
    const target = targets[nDef.code] ?? null;
    const percentage = calculateAdequacyPercentage(intake, target);

    result[nDef.code] = {
      nutrientCode: nDef.code,
      nutrientName: nDef.name,
      displayName: nDef.displayName,
      unit: nDef.unit,
      sortOrder: nDef.sortOrder,
      isMacro: nDef.isMacro,
      intake,
      target: target !== null && target !== undefined && Number.isFinite(target) ? target : null,
      percentage,
    };
  }

  return result;
}
