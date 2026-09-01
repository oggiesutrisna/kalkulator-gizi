import { getSavedMealPlansAction } from "@/features/meal-plans/meal-plan.actions";
import { SavedPlansList } from "@/features/meal-plans/components/saved-plans-list";

export const dynamic = "force-dynamic";

export default async function PlansPage() {
  const plans = await getSavedMealPlansAction();

  return <SavedPlansList initialPlans={plans} />;
}
