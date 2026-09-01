import { z } from "zod";

export const MealEntryInputSchema = z.object({
  mealType: z.enum(["breakfast", "morning_snack", "lunch", "afternoon_snack", "dinner"]),
  foodId: z.string().uuid("ID bahan makanan tidak valid"),
  weightGrams: z
    .number({ invalid_type_error: "Berat harus berupa angka" })
    .min(0, "Berat tidak boleh negatif")
    .max(10000, "Berat maksimal 10.000 gram"),
  weightMode: z.enum(["edible", "gross"]).default("edible"),
  position: z.number().int().min(0).default(0),
});

export const SaveMealPlanInputSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, "Nama menu tidak boleh kosong").max(200, "Nama menu maksimal 200 karakter"),
  notes: z.string().trim().max(1000, "Catatan maksimal 1000 karakter").optional().nullable(),
  entries: z.array(MealEntryInputSchema),
  targets: z.record(z.string(), z.number().min(0, "Target tidak boleh negatif").nullable().optional()),
});

export type MealEntryInput = z.infer<typeof MealEntryInputSchema>;
export type SaveMealPlanInput = z.infer<typeof SaveMealPlanInputSchema>;
