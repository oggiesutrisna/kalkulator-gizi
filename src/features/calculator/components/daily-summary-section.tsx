"use client";

import { Flame, Zap, Droplet, Wheat, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { NutrientAdequacy } from "@/domain/nutrition";
import { formatNutrientValue, formatPercentage } from "@/domain/nutrition/format-nutrients";

interface DailySummarySectionProps {
  adequacies: Record<string, NutrientAdequacy>;
  onOpenTargetDialog?: () => void;
}

interface MacroCardConfig {
  code: string;
  label: string;
  unit: string;
  icon: React.ReactNode;
  colorClass: string;
  progressClass: string;
}

const MACRO_CARDS: MacroCardConfig[] = [
  {
    code: "energy",
    label: "Energi",
    unit: "kkal",
    icon: <Flame className="h-5 w-5 text-amber-500" />,
    colorClass: "bg-amber-500/10 text-amber-600 border-amber-200",
    progressClass: "bg-amber-500",
  },
  {
    code: "protein",
    label: "Protein",
    unit: "g",
    icon: <Zap className="h-5 w-5 text-blue-500" />,
    colorClass: "bg-blue-500/10 text-blue-600 border-blue-200",
    progressClass: "bg-blue-500",
  },
  {
    code: "fat",
    label: "Lemak",
    unit: "g",
    icon: <Droplet className="h-5 w-5 text-rose-500" />,
    colorClass: "bg-rose-500/10 text-rose-600 border-rose-200",
    progressClass: "bg-rose-500",
  },
  {
    code: "carbohydrate",
    label: "Karbohidrat",
    unit: "g",
    icon: <Wheat className="h-5 w-5 text-emerald-600" />,
    colorClass: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
    progressClass: "bg-emerald-600",
  },
];

export function DailySummarySection({
  adequacies,
  onOpenTargetDialog,
}: DailySummarySectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-foreground">Ringkasan Gizi Harian</h3>
          <p className="text-xs text-muted-foreground">
            Total asupan gizi harian dibandingkan dengan target kebutuhan.
          </p>
        </div>

        {onOpenTargetDialog && (
          <button
            type="button"
            onClick={onOpenTargetDialog}
            className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
          >
            <Target className="h-3.5 w-3.5" />
            <span>Atur Target Kebutuhan</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {MACRO_CARDS.map((macro) => {
          const item = adequacies[macro.code];
          const intake = item?.intake;
          const target = item?.target;
          const percentage = item?.percentage;
          const hasTarget = target !== null && target !== undefined && target > 0;

          return (
            <Card
              key={macro.code}
              className="border-border/80 shadow-2xs hover:shadow-xs transition-shadow"
            >
              <CardContent className="p-4 space-y-3">
                {/* Header: Icon + Name + Percentage Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-secondary/80 flex items-center justify-center">
                      {macro.icon}
                    </div>
                    <span className="font-semibold text-sm text-foreground">{macro.label}</span>
                  </div>

                  {hasTarget ? (
                    <Badge variant="secondary" className="font-mono text-xs px-2 py-0.5 font-bold">
                      {percentage !== null ? formatPercentage(percentage) : "0%"}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[11px] text-muted-foreground font-normal">
                      Tanpa target
                    </Badge>
                  )}
                </div>

                {/* Values */}
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black tracking-tight text-foreground">
                      {formatNutrientValue(intake, macro.code)}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">{macro.unit}</span>
                  </div>

                  <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <span>Target:</span>
                    {hasTarget ? (
                      <span className="font-semibold text-foreground">
                        {formatNutrientValue(target, macro.code)} {macro.unit}
                      </span>
                    ) : (
                      <span className="text-muted-foreground italic">Belum diatur</span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                {hasTarget ? (
                  <div className="space-y-1">
                    <Progress
                      value={percentage || 0}
                      indicatorClassName={macro.progressClass}
                      className="h-2"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                      <span>0%</span>
                      <span>100%</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-2 bg-muted/60 rounded-full" />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
