import { getDatasetStatusAction } from "@/features/foods/food-search.actions";
import { getMealPlanByIdAction } from "@/features/meal-plans/meal-plan.actions";
import { CalculatorContainer } from "@/features/calculator/components/calculator-container";

export const dynamic = "force-dynamic";

interface CalculatorPageProps {
  searchParams: Promise<{
    planId?: string;
  }>;
}

export default async function CalculatorPage({ searchParams }: CalculatorPageProps) {
  const { planId } = await searchParams;
  const datasetStatus = await getDatasetStatusAction();

  let initialPlanDetail = null;
  if (planId) {
    initialPlanDetail = await getMealPlanByIdAction(planId);
  }

  return (
    <CalculatorContainer
      datasetStatus={datasetStatus}
      initialPlanDetail={initialPlanDetail}
    />
  );
}
