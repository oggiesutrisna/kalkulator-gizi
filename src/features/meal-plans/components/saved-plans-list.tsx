"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FolderOpen,
  Calendar,
  Utensils,
  Copy,
  Trash2,
  ExternalLink,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { SavedMealPlanListItem } from "../meal-plan.types";
import { deleteMealPlanAction, duplicateMealPlanAction } from "../meal-plan.actions";

interface SavedPlansListProps {
  initialPlans: SavedMealPlanListItem[];
}

export function SavedPlansList({ initialPlans }: SavedPlansListProps) {
  const router = useRouter();
  const [plans, setPlans] = useState<SavedMealPlanListItem[]>(initialPlans);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleDelete = async (planId: string, planName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus menu "${planName}"?`)) {
      return;
    }

    setDeletingId(planId);
    setStatusMsg(null);

    try {
      const res = await deleteMealPlanAction(planId);
      if (res.success) {
        setPlans((prev) => prev.filter((p) => p.id !== planId));
        setStatusMsg({ type: "success", text: `Menu "${planName}" berhasil dihapus.` });
      } else {
        setStatusMsg({ type: "error", text: res.error || "Gagal menghapus menu." });
      }
    } catch {
      setStatusMsg({ type: "error", text: "Terjadi kesalahan saat menghapus menu." });
    } finally {
      setDeletingId(null);
    }
  };

  const handleDuplicate = async (planId: string, planName: string) => {
    setDuplicatingId(planId);
    setStatusMsg(null);

    try {
      const res = await duplicateMealPlanAction(planId);
      if (res.success && res.newPlanId) {
        setStatusMsg({ type: "success", text: `Menu "${planName}" berhasil diduplikasi!` });
        router.refresh();
      } else {
        setStatusMsg({ type: "error", text: res.error || "Gagal menduplikasi menu." });
      }
    } catch {
      setStatusMsg({ type: "error", text: "Terjadi kesalahan saat menduplikasi menu." });
    } finally {
      setDuplicatingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary text-primary-foreground shadow-xs">
              <FolderOpen className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              Rencana Menu Tersimpan
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Daftar rencana makan yang telah disimpan. Buka, edit, duplikasi, atau hapus menu.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/calculator"
            className={cn(buttonVariants({ size: "sm" }), "gap-1.5 text-xs font-semibold shadow-xs")}
          >
            <Plus className="h-4 w-4" />
            <span>Buat Menu Baru</span>
          </Link>
        </div>
      </div>

      {/* Status feedback */}
      {statusMsg && (
        <div
          className={`flex items-center gap-2 p-3 rounded-lg text-xs border ${
            statusMsg.type === "success"
              ? "bg-secondary text-secondary-foreground border-border"
              : "bg-destructive/10 text-destructive border-destructive/20"
          }`}
        >
          {statusMsg.type === "success" ? (
            <CheckCircle className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Plans list */}
      {plans.length === 0 ? (
        <div className="py-16 text-center rounded-xl border border-dashed border-border bg-card p-8 space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            <Utensils className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">Belum Ada Menu Tersimpan</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Anda belum menyimpan rencana menu gizi. Masuk ke kalkulator dan klik tombol &quot;Simpan&quot;.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/calculator"
              className={cn(buttonVariants({ size: "sm" }), "text-xs font-semibold")}
            >
              Buka Kalkulator Gizi
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const isDeleting = deletingId === plan.id;
            const isDuplicating = duplicatingId === plan.id;
            const formattedDate = new Date(plan.updatedAt).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <Card key={plan.id} className="border-border/80 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-bold text-foreground leading-snug">
                      {plan.name}
                    </CardTitle>
                    <Badge variant="secondary" className="text-[11px] font-semibold shrink-0">
                      {plan.foodCount} Bahan
                    </Badge>
                  </div>
                  {plan.notes && (
                    <CardDescription className="text-xs line-clamp-2 mt-1">
                      {plan.notes}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="pb-3 text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground/80" />
                    <span>Diperbarui: {formattedDate}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0 h-4">
                      TKPI {plan.sourceVersion}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0 h-4">
                      v{plan.formulaVersion}
                    </Badge>
                  </div>
                </CardContent>

                <CardFooter className="pt-2 border-t border-border/40 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      disabled={isDuplicating || isDeleting}
                      onClick={() => handleDuplicate(plan.id, plan.name)}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      title="Duplikasi Menu"
                    >
                      {isDuplicating ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      disabled={isDeleting || isDuplicating}
                      onClick={() => handleDelete(plan.id, plan.name)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      title="Hapus Menu"
                    >
                      {isDeleting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>

                  <Link
                    href={`/calculator?planId=${plan.id}`}
                    className={cn(buttonVariants({ size: "sm" }), "h-8 text-xs gap-1.5 font-semibold")}
                  >
                    <span>Buka & Edit</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
