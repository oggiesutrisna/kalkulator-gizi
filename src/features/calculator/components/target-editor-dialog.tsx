"use client";

import { useState, useEffect } from "react";
import { Target, Check } from "lucide-react";
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
import { TKPI_NUTRIENTS } from "@/domain/nutrition/nutrition.constants";

interface TargetEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targets: Record<string, number | null>;
  onSaveTargets: (newTargets: Record<string, number | null>) => void;
}

export function TargetEditorDialog({
  open,
  onOpenChange,
  targets,
  onSaveTargets,
}: TargetEditorDialogProps) {
  const [localTargets, setLocalTargets] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      const initial: Record<string, string> = {};
      for (const nDef of TKPI_NUTRIENTS) {
        const val = targets[nDef.code];
        initial[nDef.code] = val !== null && val !== undefined ? String(val) : "";
      }
      setLocalTargets(initial);
    }
  }, [open, targets]);

  const handleChange = (code: string, valueStr: string) => {
    setLocalTargets((prev) => ({
      ...prev,
      [code]: valueStr,
    }));
  };

  const handleApplyPreset = (preset: "standard2000" | "akg2150" | "clear") => {
    const updated: Record<string, string> = {};
    for (const n of TKPI_NUTRIENTS) {
      updated[n.code] = "";
    }

    if (preset === "standard2000") {
      updated["energy"] = "2000";
      updated["protein"] = "65";
      updated["fat"] = "60";
      updated["carbohydrate"] = "300";
      updated["fiber"] = "30";
      updated["calcium"] = "1000";
      updated["iron"] = "18";
      updated["vitamin_c"] = "90";
    } else if (preset === "akg2150") {
      updated["energy"] = "2150";
      updated["protein"] = "60";
      updated["fat"] = "67";
      updated["carbohydrate"] = "323";
      updated["fiber"] = "32";
      updated["calcium"] = "1000";
      updated["iron"] = "24";
      updated["vitamin_c"] = "75";
    }

    setLocalTargets(updated);
  };

  const handleSave = () => {
    const finalMap: Record<string, number | null> = {};
    for (const nDef of TKPI_NUTRIENTS) {
      const valStr = localTargets[nDef.code]?.trim();
      if (!valStr) {
        finalMap[nDef.code] = null;
      } else {
        const num = parseFloat(valStr);
        finalMap[nDef.code] = Number.isFinite(num) && num >= 0 ? num : null;
      }
    }
    onSaveTargets(finalMap);
    onOpenChange(false);
  };

  const macros = TKPI_NUTRIENTS.filter((n) => n.isMacro);
  const others = TKPI_NUTRIENTS.filter((n) => !n.isMacro);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-secondary text-secondary-foreground">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">Target Kebutuhan Gizi</DialogTitle>
              <DialogDescription className="text-xs">
                Masukkan nilai target asupan gizi harian secara manual untuk menu ini.
              </DialogDescription>
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-2 pt-2 flex-wrap">
            <span className="text-xs text-muted-foreground font-medium">Preset cepat:</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleApplyPreset("standard2000")}
              className="h-7 text-xs px-2.5"
            >
              Standar 2000 kkal
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleApplyPreset("akg2150")}
              className="h-7 text-xs px-2.5"
            >
              AKG 2150 kkal
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleApplyPreset("clear")}
              className="h-7 text-xs px-2.5 text-muted-foreground"
            >
              Reset Target
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Makronutrien Utama */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">
              Makronutrien Utama
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {macros.map((nDef) => (
                <div key={nDef.code} className="space-y-1">
                  <label className="text-xs font-medium text-foreground flex items-center justify-between">
                    <span>{nDef.displayName}</span>
                    <span className="text-[11px] font-mono text-muted-foreground">({nDef.unit})</span>
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      min={0}
                      step="any"
                      placeholder="0"
                      value={localTargets[nDef.code] || ""}
                      onChange={(e) => handleChange(nDef.code, e.target.value)}
                      className="h-9 pr-12 text-sm font-semibold"
                    />
                    <span className="absolute right-3 top-2 text-xs text-muted-foreground font-mono">
                      {nDef.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mikronutrien & Lainnya */}
          <div className="space-y-3 pt-2 border-t border-border/60">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Mineral & Vitamin Lainnya
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {others.map((nDef) => (
                <div key={nDef.code} className="space-y-1">
                  <label className="text-xs font-medium text-foreground flex items-center justify-between truncate">
                    <span className="truncate" title={nDef.displayName}>{nDef.displayName}</span>
                    <span className="text-[10px] font-mono text-muted-foreground shrink-0 ml-1">({nDef.unit})</span>
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      min={0}
                      step="any"
                      placeholder="—"
                      value={localTargets[nDef.code] || ""}
                      onChange={(e) => handleChange(nDef.code, e.target.value)}
                      className="h-8 pr-10 text-xs"
                    />
                    <span className="absolute right-2.5 top-2 text-[10px] text-muted-foreground font-mono">
                      {nDef.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 border-t border-border bg-muted/20 sm:justify-between">
          <span className="text-[11px] text-muted-foreground italic hidden sm:inline">
            * Kosongkan untuk nutrient tanpa target.
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              className="font-semibold"
            >
              <Check className="h-4 w-4 mr-1.5" />
              Simpan Target
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
