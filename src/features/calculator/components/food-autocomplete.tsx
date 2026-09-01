"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2, X, Plus, Scale } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FoodWithNutrients } from "@/features/foods/food.types";
import { searchFoodsAction } from "@/features/foods/food-search.actions";
import { cn } from "@/lib/utils";

interface FoodAutocompleteProps {
  onSelectFood: (food: FoodWithNutrients) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function FoodAutocomplete({
  onSelectFood,
  placeholder = "Cari bahan makanan TKPI (contoh: nasi, ayam, tempe, AR001)...",
  autoFocus = false,
}: FoodAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<FoodWithNutrients[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await searchFoodsAction(query.trim(), 25);
        setResults(data);
        setIsOpen(true);
        setSelectedIndex(-1);
      } catch (err) {
        console.error("Food search error:", err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (food: FoodWithNutrients) => {
    onSelectFood(food);
    setQuery("");
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) {
      if (e.key === "ArrowDown" && results.length > 0) {
        setIsOpen(true);
        setSelectedIndex(0);
        e.preventDefault();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelect(results[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="pl-9 pr-9 h-10 border-input focus-visible:ring-ring bg-background"
        />
        {isLoading ? (
          <Loader2 className="absolute right-3 h-4 w-4 text-primary animate-spin" />
        ) : query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 text-muted-foreground hover:text-foreground p-0.5 rounded-xs"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full max-h-80 overflow-y-auto rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-xl">
          {isLoading && results.length === 0 ? (
            <div className="flex items-center justify-center p-4 text-sm text-muted-foreground gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>Mencari data TKPI...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Tidak ada bahan makanan yang cocok dengan &ldquo;{query}&rdquo;.
            </div>
          ) : (
            <div className="space-y-0.5">
              {results.map((food, index) => {
                const isSelected = index === selectedIndex;
                const energy = food.nutrients?.energy;
                const protein = food.nutrients?.protein;
                const fat = food.nutrients?.fat;
                const carb = food.nutrients?.carbohydrate;

                return (
                  <button
                    key={food.id}
                    type="button"
                    onClick={() => handleSelect(food)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-md text-sm transition-colors flex items-center justify-between gap-2",
                      isSelected
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-muted/70"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-foreground truncate">{food.name}</span>
                        <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0 h-4 border-border text-foreground">
                          {food.code}
                        </Badge>
                        {food.bddPercent !== null && food.bddPercent !== undefined ? (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-muted/90 text-muted-foreground gap-1">
                            <Scale className="h-2.5 w-2.5" />
                            BDD: {food.bddPercent}%
                          </Badge>
                        ) : null}
                      </div>

                      {/* Nutrient quick preview per 100g */}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span>
                          Energi: <strong className="text-foreground">{energy !== null && energy !== undefined ? Math.round(energy) : "—"}</strong> kkal
                        </span>
                        <span>
                          P: <strong className="text-foreground">{protein ?? "—"}</strong>g
                        </span>
                        <span>
                          L: <strong className="text-foreground">{fat ?? "—"}</strong>g
                        </span>
                        <span>
                          KH: <strong className="text-foreground">{carb ?? "—"}</strong>g
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <Button
                        size="icon-sm"
                        variant={isSelected ? "default" : "secondary"}
                        className="h-7 w-7 rounded-full"
                        tabIndex={-1}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
