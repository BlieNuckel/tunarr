import type { PurchaseDecisionConfig } from "../../config";
import type {
  PurchaseData,
  PurchaseContext,
  Signal,
  Recommendation,
  FactorEvaluator,
} from "./types";
import { evaluateLabel } from "./evaluateLabel";
import { evaluateAge } from "./evaluateAge";

const EVALUATORS: FactorEvaluator[] = [evaluateLabel, evaluateAge];

/** "request" beats "buy" beats "neutral" */
function resolveRecommendation(signals: Signal[]): Recommendation {
  if (signals.some((s) => s.recommendation === "request")) return "request";
  if (signals.some((s) => s.recommendation === "buy")) return "buy";
  return "neutral";
}

export function evaluatePurchaseDecision(
  data: PurchaseData,
  config: PurchaseDecisionConfig
): PurchaseContext {
  const signals = EVALUATORS.map((evaluate) => evaluate(data, config)).filter(
    (s): s is Signal => s !== null
  );

  return {
    recommendation: resolveRecommendation(signals),
    signals,
    label: data.label,
  };
}
