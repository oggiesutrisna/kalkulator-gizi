"use client";

import * as React from "react";
import { MealNutrientCalculation } from "@/domain/nutrition";
import { formatNutrientValue } from "@/domain/nutrition/format-nutrients";
import { Zap, Flame, Droplet, Wheat } from "lucide-react";

interface MealSubtotalBarProps {
  label: string;
  calculation?: MealNutrientCalculation;
}

export function MealSubtotalBar({ label, calculation }: MealSubtotalBarProps) {
  const energy = calculation?.totals?.energy;
  const protein = calculation?.totals?.protein;
  const fat = calculation?.totals?.fat;
  const carb = calculation?.totals?.carbohydrate;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-secondary/70 border border-border px-3.5 py-2.5 text-xs text-foreground">
      <div className="font-semibold text-foreground">
        Subtotal {label}
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Flame className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-muted-foreground">Energi:</span>
          <span className="font-bold text-foreground">
            {formatNutrientValue(energy, "energy")} <span className="font-normal text-muted-foreground">kkal</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-blue-500" />
          <span className="text-muted-foreground">Protein:</span>
          <span className="font-bold text-foreground">
            {formatNutrientValue(protein, "protein")} <span className="font-normal text-muted-foreground">g</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Droplet className="h-3.5 w-3.5 text-rose-500" />
          <span className="text-muted-foreground">Lemak:</span>
          <span className="font-bold text-foreground">
            {formatNutrientValue(fat, "fat")} <span className="font-normal text-muted-foreground">g</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Wheat className="h-3.5 w-3.5 text-amber-600" />
          <span className="text-muted-foreground">Karbohidrat:</span>
          <span className="font-bold text-foreground">
            {formatNutrientValue(carb, "carbohydrate")} <span className="font-normal text-muted-foreground">g</span>
          </span>
        </div>
      </div>
    </div>
  );
}
