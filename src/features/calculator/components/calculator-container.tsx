"use client";

import { useState } from "react";
import { MEAL_TYPES } from "@/domain/nutrition/nutrition.constants";
import { useCalculator } from "../use-calculator";
import { CalculatorHeader } from "./calculator-header";
import { DailySummarySection } from "./daily-summary-section";
import { MealSectionCard } from "./meal-section-card";
import { DetailedNutrientTable } from "./detailed-nutrient-table";
import { TargetEditorDialog } from "./target-editor-dialog";
import { SavePlanDialog } from "./save-plan-dialog";
import { EmptyDatasetBanner } from "./empty-dataset-banner";
import { DisclaimerFooter } from "./disclaimer-footer";
import { SavedMealPlanDetail } from "@/features/meal-plans/meal-plan.types";
import { DatasetStatus } from "@/features/foods/food.types";

interface CalculatorContainerProps {
  datasetStatus: DatasetStatus;
  initialPlanDetail?: SavedMealPlanDetail | null;
}

export function CalculatorContainer({
  datasetStatus,
  initialPlanDetail,
}: CalculatorContainerProps) {
  const {
    planId,
    setPlanId,
    planName,
    setPlanName,
    notes,
    setNotes,
    sections,
    targets,
    addFood,
    updateFoodWeight,
    updateFoodWeightMode,
    removeFood,
    clearMealSection,
    setAllTargets,
    resetCalculator,
    totalFoodCount,
    calculations,
  } = useCalculator(initialPlanDetail);

  const [isTargetDialogOpen, setIsTargetDialogOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

  const handleSaveSuccess = (savedId: string, savedName: string, savedNotes: string) => {
    setPlanId(savedId);
    setPlanName(savedName);
    setNotes(savedNotes);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Warning banner if database has 0 foods */}
      {!datasetStatus.isImported && <EmptyDatasetBanner />}

      {/* Header */}
      <CalculatorHeader
        planId={planId}
        planName={planName}
        notes={notes}
        onPlanNameChange={setPlanName}
        onNotesChange={setNotes}
        onOpenSaveDialog={() => setIsSaveDialogOpen(true)}
        onOpenTargetDialog={() => setIsTargetDialogOpen(true)}
        onResetCalculator={resetCalculator}
        totalFoodCount={totalFoodCount}
      />

      {/* Daily Summary (prominent macro cards with progress) */}
      <DailySummarySection
        adequacies={calculations.adequacies}
        onOpenTargetDialog={() => setIsTargetDialogOpen(true)}
      />

      {/* Meal Sections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground">
            Susunan Waktu Makan ({totalFoodCount} Total Bahan)
          </h3>
          <span className="text-xs text-muted-foreground">
            Pilih bahan makanan dan masukkan berat (gram).
          </span>
        </div>

        <div className="space-y-4">
          {MEAL_TYPES.map((mealDef) => (
            <MealSectionCard
              key={mealDef.id}
              mealType={mealDef.id}
              label={mealDef.label}
              defaultTime={mealDef.defaultTime}
              entries={sections[mealDef.id] || []}
              calculation={calculations.mealCalculationByType[mealDef.id]}
              foodCalculations={calculations.foodCalculationsByTempId}
              onAddFood={addFood}
              onUpdateWeight={updateFoodWeight}
              onUpdateWeightMode={updateFoodWeightMode}
              onRemoveFood={removeFood}
              onClearSection={clearMealSection}
            />
          ))}
        </div>
      </div>

      {/* Detailed Nutrient Table (all 21 nutrients) */}
      <DetailedNutrientTable
        adequacies={calculations.adequacies}
        onOpenTargetDialog={() => setIsTargetDialogOpen(true)}
      />

      {/* Target Editor Dialog */}
      <TargetEditorDialog
        open={isTargetDialogOpen}
        onOpenChange={setIsTargetDialogOpen}
        targets={targets}
        onSaveTargets={setAllTargets}
      />

      {/* Save Plan Dialog */}
      <SavePlanDialog
        open={isSaveDialogOpen}
        onOpenChange={setIsSaveDialogOpen}
        planId={planId}
        planName={planName}
        notes={notes}
        sections={sections}
        targets={targets}
        onSaveSuccess={handleSaveSuccess}
      />

      {/* Informational Disclaimer Footer */}
      <DisclaimerFooter />
    </div>
  );
}
