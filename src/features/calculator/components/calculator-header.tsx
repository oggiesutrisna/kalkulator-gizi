"use client";

import Link from "next/link";
import { Apple, Save, PlusCircle, FolderOpen, Target, Utensils } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TKPI_SOURCE_VERSION, NUTRITION_FORMULA_VERSION } from "@/domain/nutrition/nutrition.constants";

interface CalculatorHeaderProps {
  planId: string | null;
  planName: string;
  notes: string;
  onPlanNameChange: (name: string) => void;
  onNotesChange: (notes: string) => void;
  onOpenSaveDialog: () => void;
  onOpenTargetDialog: () => void;
  onResetCalculator: () => void;
  totalFoodCount: number;
}

export function CalculatorHeader({
  planId,
  planName,
  notes,
  onPlanNameChange,
  onNotesChange,
  onOpenSaveDialog,
  onOpenTargetDialog,
  onResetCalculator,
  totalFoodCount,
}: CalculatorHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Top Bar: Brand, Badges & Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-4 border-b border-border">
        {/* Brand & Subtitle */}
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="p-2 rounded-xl bg-primary text-primary-foreground shadow-xs">
              <Apple className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                Kalkulator Gizi TKPI
              </h1>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge variant="secondary" className="text-xs font-semibold px-2 py-0.5 border border-border">
                Sumber: TKPI {TKPI_SOURCE_VERSION}
              </Badge>
              <Badge variant="outline" className="text-xs font-mono px-2 py-0.5 text-muted-foreground">
                Formula: MVP v{NUTRITION_FORMULA_VERSION}
              </Badge>
              {totalFoodCount > 0 && (
                <Badge variant="secondary" className="text-xs font-medium px-2 py-0.5 gap-1 bg-secondary text-secondary-foreground">
                  <Utensils className="h-3 w-3" />
                  <span>{totalFoodCount} Bahan</span>
                </Badge>
              )}
            </div>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Hitung nilai gizi menu berdasarkan data TKPI 2020.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenTargetDialog}
            className="h-9 text-xs gap-1.5"
          >
            <Target className="h-4 w-4 text-primary" />
            <span>Target Gizi</span>
          </Button>

          <Link
            href="/plans"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-9 text-xs gap-1.5")}
          >
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
            <span>Rencana Tersimpan</span>
          </Link>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onResetCalculator}
            className="h-9 text-xs gap-1.5"
          >
            <PlusCircle className="h-4 w-4 text-muted-foreground" />
            <span>Menu Baru</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={onOpenSaveDialog}
            className="h-9 text-xs gap-1.5 font-semibold"
          >
            <Save className="h-4 w-4" />
            <span>{planId ? "Perbarui" : "Simpan"}</span>
          </Button>
        </div>
      </div>

      {/* Plan Name & Notes Card */}
      <div className="rounded-xl border border-border/80 bg-card p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-bold text-foreground">
              Nama Menu / Rencana Makan
            </label>
            <Input
              type="text"
              value={planName}
              onChange={(e) => onPlanNameChange(e.target.value)}
              placeholder="Contoh: Menu Standar Pasien Dewasa 2100 kkal"
              className="h-9 text-sm font-semibold bg-background"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground">
              Catatan (Opsional)
            </label>
            <Input
              type="text"
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Contoh: Diet rendah purin / tanpa santan"
              className="h-9 text-xs bg-background"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
