import type { PurchaseDecisionConfig } from "../../config";
import type { PurchaseData, Signal, LabelInfo } from "./types";

function matchesBlocklist(
  labelName: string,
  blocklist: string[]
): string | null {
  const lower = labelName.toLowerCase();
  return blocklist.find((entry) => lower.includes(entry.toLowerCase())) ?? null;
}

export function evaluateLabel(
  data: PurchaseData,
  config: PurchaseDecisionConfig
): Signal | null {
  if (!data.label) {
    return null;
  }

  const directMatch = matchesBlocklist(data.label.name, config.labelBlocklist);
  if (directMatch) {
    return {
      factor: "label",
      recommendation: "request",
      reason: `${data.label.name} is on your blocklist`,
    };
  }

  const blockedAncestor = findBlocklistedAncestor(
    data.labelAncestors,
    config.labelBlocklist
  );
  if (blockedAncestor) {
    return {
      factor: "label",
      recommendation: "request",
      reason: `${data.label.name} is a subsidiary of ${blockedAncestor.name} (blocklisted)`,
    };
  }

  return {
    factor: "label",
    recommendation: "buy",
    reason: `${data.label.name} is not on your blocklist`,
  };
}

function findBlocklistedAncestor(
  ancestors: LabelInfo[],
  blocklist: string[]
): LabelInfo | null {
  for (const ancestor of ancestors) {
    if (matchesBlocklist(ancestor.name, blocklist)) {
      return ancestor;
    }
  }
  return null;
}
