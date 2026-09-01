"use client";

import * as React from "react";
import { Trash2, AlertCircle, Scale } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CalculatorFoodEntry } from "../calculator.types";
import { FoodNutrientCalculation } from "@/domain/nutrition";
import { formatNutrientValue } from "@/domain/nutrition/format-nutrients";
import { WeightMode } from "@/domain/nutrition/nutrition.constants";
import { cn } from "@/lib/utils";

interface MealFoodRowProps {
  entry: CalculatorFoodEntry;
  calculation?: FoodNutrientCalculation;
  onUpdateWeight: (weight: number) => void;
  onUpdateWeightMode: (mode: WeightMode) => void;
  onRemove: () => void;
}

export function MealFoodRow({
  entry,
  calculation,
  onUpdateWeight,
  onUpdateWeightMode,
  onRemove,
}: MealFoodRowProps) {
  const food = entry.food;
  const bdd = food.bddPercent;
  const hasWarning = calculation?.warnings && calculation.warnings.length > 0;

  const energy = calculation?.nutrients?.energy;
  const protein = calculation?.nutrients?.protein;
  const fat = calculation?.nutrients?.fat;
  const carb = calculation?.nutrients?.carbohydrate;

  return (
    <div className="group relative rounded-lg border border-border bg-card p-3 shadow-2xs transition-all hover:border-primary/50 hover:shadow-xs">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        {/* Food Name and Meta */}
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-foreground text-sm leading-tight">
              {food.name}
            </span>
            <Badge
              variant="outline"
              className="text-[10px] font-mono px-1.5 py-0 h-4 border-border text-foreground"
            >
              {food.code}
            </Badge>

            {bdd !== null && bdd !== undefined ? (
              <Badge
                variant="secondary"
                className={cn(
                  "text-[10px] px-1.5 py-0 h-4 gap-1",
                  entry.weightMode === "gross"
                    ? "bg-accent text-accent-foreground font-semibold"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <Scale className="h-2.5 w-2.5" />
                BDD: {bdd}%
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] text-muted-foreground px-1.5 py-0 h-4">
                BDD: —
              </Badge>
            )}
          </div>

          {/* Quick macro values for this row */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1">
              <span className="text-muted-foreground/80">Energi:</span>
              <strong className="text-foreground font-medium">
                {formatNutrientValue(energy, "energy")}
              </strong>{" "}
              kkal
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="text-muted-foreground/80">Prot:</span>
              <strong className="text-foreground font-medium">
                {formatNutrientValue(protein, "protein")}
              </strong>{" "}
              g
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="text-muted-foreground/80">Lemak:</span>
              <strong className="text-foreground font-medium">
                {formatNutrientValue(fat, "fat")}
              </strong>{" "}
              g
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="text-muted-foreground/80">KH:</span>
              <strong className="text-foreground font-medium">
                {formatNutrientValue(carb, "carbohydrate")}
              </strong>{" "}
              g
            </span>

            {/* Effective edible weight display when gross weight is active */}
            {entry.weightMode === "gross" && calculation && (
              <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-xs">
                Berat bersih: {Math.round(calculation.effectiveWeight * 10) / 10}g
              </span>
            )}
          </div>
        </div>

        {/* Inputs: Weight + Mode + Remove */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Weight Mode Selector */}
          <div className="w-36">
            <Select
              value={entry.weightMode}
              onValueChange={(val) => onUpdateWeightMode(val as WeightMode)}
            >
              <SelectTrigger className="h-8 text-xs bg-background">
                <SelectValue placeholder="Mode Berat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="edible" className="text-xs">
                  Berat dimakan
                </SelectItem>
                <SelectItem value="gross" className="text-xs">
                  Berat kotor
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Weight input with 'g' suffix */}
          <div className="relative flex items-center w-24">
            <Input
              type="number"
              min={0}
              max={10000}
              step="any"
              value={entry.weightGrams === 0 ? "" : entry.weightGrams}
              onChange={(e) => {
                const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
                onUpdateWeight(Number.isFinite(val) ? val : 0);
              }}
              placeholder="0"
              className="h-8 pr-6 text-right text-xs font-semibold"
            />
            <span className="absolute right-2 text-xs text-muted-foreground pointer-events-none font-medium">
              g
            </span>
          </div>

          {/* Remove Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={onRemove}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Hapus bahan makanan</span>
                  </Button>
                }
              />
              <TooltipContent>
                <p>Hapus dari menu</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Warning Alert if any (e.g. Gross weight mode on food with missing BDD) */}
      {hasWarning && (
        <div className="mt-2 flex items-start gap-1.5 rounded-md bg-amber-50 dark:bg-amber-950/40 p-2 text-xs text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>{calculation?.warnings.join("; ")}</span>
        </div>
      )}
    </div>
  );
}
