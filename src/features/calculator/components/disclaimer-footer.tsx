import { Info } from "lucide-react";

export function DisclaimerFooter() {
  return (
    <footer className="mt-12 pt-6 pb-8 border-t border-border/60 text-center text-xs text-muted-foreground space-y-2">
      <div className="flex items-center justify-center gap-1.5 text-muted-foreground/90">
        <Info className="h-3.5 w-3.5" />
        <span>
          Perhitungan berdasarkan data TKPI 2020. Hasil perlu ditinjau oleh tenaga gizi sebelum digunakan untuk keputusan profesional.
        </span>
      </div>
      <p className="text-[11px] text-muted-foreground/60">
        Kalkulator Gizi TKPI MVP • Drizzle ORM • Next.js 16 Active LTS • TypeScript
      </p>
    </footer>
  );
}
