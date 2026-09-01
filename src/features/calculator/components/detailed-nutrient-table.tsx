"use client";

import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, Table as TableIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TKPI_NUTRIENTS } from "@/domain/nutrition/nutrition.constants";
import { NutrientAdequacy } from "@/domain/nutrition";
import { formatNutrientValue, formatPercentage } from "@/domain/nutrition/format-nutrients";

interface DetailedNutrientTableProps {
  adequacies: Record<string, NutrientAdequacy>;
  onOpenTargetDialog?: () => void;
}

type NutrientCategory = "all" | "macro" | "mineral" | "vitamin";

function getCategoryForNutrient(code: string): "macro" | "mineral" | "vitamin" {
  if (["energy", "protein", "fat", "carbohydrate", "fiber", "water", "ash"].includes(code)) {
    return "macro";
  }
  if (["calcium", "phosphorus", "iron", "sodium", "potassium", "copper", "zinc"].includes(code)) {
    return "mineral";
  }
  return "vitamin";
}

export function DetailedNutrientTable({
  adequacies,
  onOpenTargetDialog,
}: DetailedNutrientTableProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<NutrientCategory>("all");

  const filteredNutrients = useMemo(() => {
    return TKPI_NUTRIENTS.filter((nDef) => {
      if (activeTab === "all") return true;
      const cat = getCategoryForNutrient(nDef.code);
      return cat === activeTab;
    });
  }, [activeTab]);

  return (
    <Card className="border-border/80 shadow-2xs">
      <CardHeader className="p-4 sm:px-6 flex flex-row items-center justify-between border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-secondary/80 flex items-center justify-center">
            <TableIcon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-foreground">
              Detail Zat Gizi (21 Komposisi TKPI)
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Rincian lengkap makronutrien, mineral, dan vitamin per hari.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenTargetDialog && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenTargetDialog}
              className="h-8 text-xs border-border"
            >
              Ubah Target
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen((prev) => !prev)}
            className="h-8 text-xs text-muted-foreground gap-1"
          >
            <span>{isOpen ? "Tutup" : "Buka"}</span>
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      {isOpen && (
        <CardContent className="p-4 sm:p-6 space-y-4">
          {/* Category Tabs */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as NutrientCategory)}
              className="w-full sm:w-auto"
            >
              <TabsList className="grid grid-cols-4 sm:flex h-8 bg-muted/60">
                <TabsTrigger value="all" className="text-xs px-3">
                  Semua ({TKPI_NUTRIENTS.length})
                </TabsTrigger>
                <TabsTrigger value="macro" className="text-xs px-3">
                  Makro & Energi
                </TabsTrigger>
                <TabsTrigger value="mineral" className="text-xs px-3">
                  Mineral
                </TabsTrigger>
                <TabsTrigger value="vitamin" className="text-xs px-3">
                  Vitamin
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Table */}
          <div className="rounded-lg border border-border/80 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="font-bold text-foreground">Zat Gizi</TableHead>
                  <TableHead className="text-right font-bold text-foreground">Asupan</TableHead>
                  <TableHead className="text-right font-bold text-foreground">Kebutuhan</TableHead>
                  <TableHead className="text-right font-bold text-foreground">Pemenuhan</TableHead>
                  <TableHead className="text-center font-bold text-foreground w-16">Unit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNutrients.map((nDef) => {
                  const item = adequacies[nDef.code];
                  const intake = item?.intake;
                  const target = item?.target;
                  const percentage = item?.percentage;
                  const isMacro = nDef.isMacro;

                  return (
                    <TableRow
                      key={nDef.code}
                      className={isMacro ? "bg-muted/30 font-medium" : undefined}
                    >
                      <TableCell className="font-medium text-foreground py-2.5">
                        <div className="flex items-center gap-1.5">
                          <span>{nDef.displayName}</span>
                          {isMacro && (
                            <Badge variant="secondary" className="text-[9px] px-1 py-0 h-3.5 font-semibold">
                              Utama
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="text-right font-mono text-sm py-2.5 font-semibold text-foreground">
                        {formatNutrientValue(intake, nDef.code)}
                      </TableCell>

                      <TableCell className="text-right font-mono text-sm py-2.5 text-muted-foreground">
                        {target !== null && target !== undefined && target > 0 ? (
                          <span className="text-foreground">{formatNutrientValue(target, nDef.code)}</span>
                        ) : (
                          <span className="text-muted-foreground/60">—</span>
                        )}
                      </TableCell>

                      <TableCell className="text-right font-mono text-sm py-2.5">
                        {percentage !== null ? (
                          <Badge
                            variant="secondary"
                            className="font-mono font-bold text-xs px-2 py-0.5"
                          >
                            {formatPercentage(percentage)}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground/60">—</span>
                        )}
                      </TableCell>

                      <TableCell className="text-center text-xs text-muted-foreground py-2.5 font-mono">
                        {nDef.unit}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
