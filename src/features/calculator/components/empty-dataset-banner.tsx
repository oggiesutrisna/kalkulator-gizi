"use client";

import { AlertTriangle, Terminal } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export function EmptyDatasetBanner() {
  return (
    <Alert variant="warning" className="border-amber-300 dark:border-amber-800">
      <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
      <div className="ml-2">
        <AlertTitle className="text-sm font-bold text-amber-900 dark:text-amber-200">
          Data TKPI Belum Tersedia
        </AlertTitle>
        <AlertDescription className="text-xs text-amber-800 dark:text-amber-300 space-y-2 mt-1">
          <p>
            Database belum memiliki data komposisi pangan TKPI 2020.
          </p>
          <div className="flex items-center gap-2 p-2 rounded-md bg-amber-100/80 dark:bg-amber-900/40 font-mono text-[11px]">
            <Terminal className="h-3.5 w-3.5" />
            <span>pnpm import:tkpi</span>
          </div>
          <p className="text-[11px] text-amber-700 dark:text-amber-400">
            Jalankan perintah di atas di terminal untuk mengimpor 1.100+ bahan makanan dari file Excel workbook.
          </p>
        </AlertDescription>
      </div>
    </Alert>
  );
}
