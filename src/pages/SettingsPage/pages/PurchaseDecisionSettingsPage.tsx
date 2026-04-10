import { useSettings } from "@/context/useSettings";
import { useAutoSave } from "@/hooks/useAutoSave";
import PurchaseDecisionSection from "../sections/purchaseDecision/PurchaseDecisionSection";
import { DEFAULT_PURCHASE_DECISION } from "@/context/purchaseDecisionDefaults";
import Skeleton from "@/components/Skeleton";
import SaveStatusIndicator from "../shared/SaveStatusIndicator";

export default function PurchaseDecisionSettingsPage() {
  const { settings, isLoading, savePartialSettings } = useSettings();
  const { fields, saveStatus, saveError, updateField } = useAutoSave(
    settings,
    savePartialSettings
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-64" />
        <div className="space-y-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <SaveStatusIndicator status={saveStatus} error={saveError} />
      </div>

      <PurchaseDecisionSection
        config={fields.purchaseDecision ?? DEFAULT_PURCHASE_DECISION}
        onConfigChange={(updated) => updateField("purchaseDecision", updated)}
      />
    </div>
  );
}
