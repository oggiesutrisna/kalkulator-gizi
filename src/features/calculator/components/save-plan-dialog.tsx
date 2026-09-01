"use client";

import { useState } from "react";
import { Save, Loader2, CheckCircle2, AlertCircle, BookmarkCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { saveMealPlanAction } from "@/features/meal-plans/meal-plan.actions";
import { CalculatorFoodEntry } from "../calculator.types";
import { MealTypeId } from "@/domain/nutrition/nutrition.constants";

interface SavePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string | null;
  planName: string;
  notes: string;
  sections: Record<MealTypeId, CalculatorFoodEntry[]>;
  targets: Record<string, number | null>;
  onSaveSuccess: (savedPlanId: string, savedName: string, savedNotes: string) => void;
}

export function SavePlanDialog({
  open,
  onOpenChange,
  planId,
  planName,
  notes,
  sections,
  targets,
  onSaveSuccess,
}: SavePlanDialogProps) {
  const [name, setName] = useState(planName);
  const [planNotes, setPlanNotes] = useState(notes);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync initial values when opened
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setName(planName);
      setPlanNotes(notes);
      setErrorMsg(null);
      setSuccessMsg(null);
    }
    onOpenChange(isOpen);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Nama rencana menu wajib diisi.");
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    // Flatten entries
    const entriesPayload: {
      mealType: MealTypeId;
      foodId: string;
      weightGrams: number;
      weightMode: "edible" | "gross";
      position: number;
    }[] = [];

    let positionCounter = 0;
    for (const [mType, items] of Object.entries(sections)) {
      for (const item of items) {
        entriesPayload.push({
          mealType: mType as MealTypeId,
          foodId: item.foodId,
          weightGrams: item.weightGrams,
          weightMode: item.weightMode,
          position: positionCounter++,
        });
      }
    }

    try {
      const result = await saveMealPlanAction({
        id: planId || undefined,
        name: name.trim(),
        notes: planNotes.trim() || undefined,
        entries: entriesPayload,
        targets,
      });

      if (!result.success || !result.planId) {
        setErrorMsg(result.error || "Gagal menyimpan menu.");
      } else {
        setSuccessMsg("Rencana menu berhasil disimpan ke database!");
        onSaveSuccess(result.planId, name.trim(), planNotes.trim());
        setTimeout(() => {
          onOpenChange(false);
        }, 1200);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(`Terjadi kesalahan: ${msg}`);
    } finally {
      setIsSaving(false);
    }
  };

  let totalItems = 0;
  for (const items of Object.values(sections)) {
    totalItems += items.length;
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSave} className="space-y-4">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-md bg-secondary text-secondary-foreground">
                <BookmarkCheck className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">
                  {planId ? "Perbarui Rencana Menu" : "Simpan Rencana Menu"}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Simpan komposisi bahan makanan dan target gizi ke database.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-xs border border-destructive/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary text-secondary-foreground text-xs border border-border">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Nama Menu / Rencana Makan <span className="text-destructive">*</span>
              </label>
              <Input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Menu Diet Rendah Garam 2000 kkal"
                className="text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Catatan Tambahan (Opsional)</label>
              <textarea
                rows={3}
                value={planNotes}
                onChange={(e) => setPlanNotes(e.target.value)}
                placeholder="Tambahkan catatan khusus, tujuan diet, atau instruksi menu..."
                className="w-full rounded-md border border-input bg-background p-2.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div className="p-3 rounded-lg bg-muted/40 text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Total bahan makanan:</span>
                <span className="font-semibold text-foreground">{totalItems} bahan</span>
              </div>
              <div className="flex justify-between">
                <span>Versi sumber data:</span>
                <span className="font-semibold text-foreground">TKPI 2020</span>
              </div>
              <div className="flex justify-between">
                <span>Versi formula:</span>
                <span className="font-semibold text-foreground">1.0.0</span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSaving}
              className="font-semibold"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1.5" />
                  <span>{planId ? "Perbarui Menu" : "Simpan Sekarang"}</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
