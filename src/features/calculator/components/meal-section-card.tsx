"use client";

import { useState } from "react";
import { Plus, Sun, Sunrise, Moon, Coffee, UtensilsCrossed } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MealFoodRow } from "./meal-food-row";
import { FoodAutocomplete } from "./food-autocomplete";
import { MealSubtotalBar } from "./meal-subtotal-bar";
import { CalculatorFoodEntry } from "../calculator.types";
import { FoodNutrientCalculation, MealNutrientCalculation } from "@/domain/nutrition";
import { MealTypeId, WeightMode } from "@/domain/nutrition/nutrition.constants";
import { FoodWithNutrients } from "@/features/foods/food.types";

interface MealSectionCardProps {
  mealType: MealTypeId;
  label: string;
  defaultTime: string;
  entries: CalculatorFoodEntry[];
  calculation?: MealNutrientCalculation;
  foodCalculations: Record<string, FoodNutrientCalculation>;
  onAddFood: (mealType: MealTypeId, food: FoodWithNutrients, weight: number, mode: WeightMode) => void;
  onUpdateWeight: (mealType: MealTypeId, tempId: string, weight: number) => void;
  onUpdateWeightMode: (mealType: MealTypeId, tempId: string, mode: WeightMode) => void;
  onRemoveFood: (mealType: MealTypeId, tempId: string) => void;
  onClearSection: (mealType: MealTypeId) => void;
}

function getMealIcon(mealType: MealTypeId) {
  switch (mealType) {
    case "breakfast":
      return <Sunrise className="h-4 w-4 text-amber-500" />;
    case "morning_snack":
      return <Coffee className="h-4 w-4 text-emerald-600" />;
    case "lunch":
      return <Sun className="h-4 w-4 text-amber-600" />;
    case "afternoon_snack":
      return <Coffee className="h-4 w-4 text-teal-600" />;
    case "dinner":
      return <Moon className="h-4 w-4 text-indigo-500" />;
    default:
      return <UtensilsCrossed className="h-4 w-4 text-primary" />;
  }
}

export function MealSectionCard({
  mealType,
  label,
  defaultTime,
  entries,
  calculation,
  foodCalculations,
  onAddFood,
  onUpdateWeight,
  onUpdateWeightMode,
  onRemoveFood,
  onClearSection,
}: MealSectionCardProps) {
  const [isAddingFood, setIsAddingFood] = useState(false);

  const handleSelectFood = (food: FoodWithNutrients) => {
    onAddFood(mealType, food, 100, "edible");
    setIsAddingFood(false);
  };

  return (
    <Card className="border-border/80 shadow-2xs">
      <CardHeader className="pb-3 pt-4 px-4 sm:px-6 flex flex-row items-center justify-between border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-secondary/80 flex items-center justify-center">
            {getMealIcon(mealType)}
          </div>
          <div>
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              {label}
              <Badge variant="secondary" className="text-[11px] font-normal px-2 py-0 h-5">
                {entries.length} bahan
              </Badge>
            </CardTitle>
            <span className="text-xs text-muted-foreground">Waktu: {defaultTime}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {entries.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onClearSection(mealType)}
              className="text-xs text-muted-foreground hover:text-destructive h-8 px-2"
            >
              Kosongkan
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsAddingFood((prev) => !prev)}
            className="h-8 gap-1.5 text-xs font-semibold border-border bg-secondary hover:bg-secondary/80 text-secondary-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Tambah Bahan</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-3">
        {/* Inline Autocomplete when active */}
        {isAddingFood && (
          <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">
                Pilih Bahan Makanan untuk {label}:
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAddingFood(false)}
                className="h-6 text-xs px-2 text-muted-foreground"
              >
                Batal
              </Button>
            </div>
            <FoodAutocomplete
              onSelectFood={handleSelectFood}
              autoFocus
              placeholder={`Cari bahan makanan TKPI untuk ${label}...`}
            />
          </div>
        )}

        {/* Food rows list */}
        {entries.length === 0 ? (
          <div className="py-6 text-center rounded-lg border border-dashed border-border/80 bg-muted/20">
            <p className="text-xs text-muted-foreground">
              Belum ada bahan makanan pada {label.toLowerCase()}.
            </p>
            {!isAddingFood && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsAddingFood(true)}
                className="mt-2 text-xs text-emerald-700 dark:text-emerald-300 gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                Tambah bahan sekarang
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => (
              <MealFoodRow
                key={entry.tempId}
                entry={entry}
                calculation={foodCalculations[entry.tempId]}
                onUpdateWeight={(w) => onUpdateWeight(mealType, entry.tempId, w)}
                onUpdateWeightMode={(m) => onUpdateWeightMode(mealType, entry.tempId, m)}
                onRemove={() => onRemoveFood(mealType, entry.tempId)}
              />
            ))}
          </div>
        )}

        {/* Meal Subtotal Bar */}
        {entries.length > 0 && (
          <div className="pt-2">
            <MealSubtotalBar label={label} calculation={calculation} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
