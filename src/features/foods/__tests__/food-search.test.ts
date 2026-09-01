import { describe, it, expect } from "vitest";
import { searchFoodsAction, getDatasetStatusAction } from "../food-search.actions";

describe("Food Search and Database Integration", () => {
  it("retrieves dataset status showing imported TKPI foods and nutrients", async () => {
    const status = await getDatasetStatusAction();
    expect(status.isImported).toBe(true);
    expect(status.foodCount).toBeGreaterThanOrEqual(1100);
    expect(status.nutrientCount).toBe(21);
    expect(status.sourceVersion).toBe("2020");
  });

  it("searches food by name (e.g. 'nasi')", async () => {
    const results = await searchFoodsAction("nasi", 10);
    expect(results.length).toBeGreaterThan(0);
    const rice = results.find((r) => r.name.toLowerCase().includes("nasi"));
    expect(rice).toBeDefined();
    expect(rice?.nutrients).toBeDefined();
    expect(typeof rice?.nutrients.energy).toBe("number");
  });

  it("searches food by TKPI code (e.g. 'AR001')", async () => {
    const results = await searchFoodsAction("AR001", 5);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].code).toBe("AR001");
    expect(results[0].nutrients.energy).toBe(357);
    expect(results[0].nutrients.protein).toBe(8.4);
  });

  it("handles empty query gracefully", async () => {
    const results = await searchFoodsAction("", 10);
    expect(results).toEqual([]);
  });

  it("handles nonexistent food query gracefully", async () => {
    const results = await searchFoodsAction("xyznonexistentfood12345", 10);
    expect(results).toEqual([]);
  });
});
