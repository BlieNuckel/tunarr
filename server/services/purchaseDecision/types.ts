import type { PurchaseDecisionConfig } from "../../config";

export type Recommendation = "buy" | "request" | "neutral";

export type Signal = {
  factor: string;
  recommendation: Recommendation;
  reason: string;
};

export type LabelInfo = {
  name: string;
  mbid: string;
};

/** Collected data that factor evaluators inspect */
export type PurchaseData = {
  label: LabelInfo | null;
  labelAncestors: LabelInfo[];
  firstReleaseDate: string | null;
};

/** Final response sent to the frontend */
export type PurchaseContext = {
  recommendation: Recommendation;
  signals: Signal[];
  label: LabelInfo | null;
};

export type FactorEvaluator = (
  data: PurchaseData,
  config: PurchaseDecisionConfig
) => Signal | null;
