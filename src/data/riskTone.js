import { getRiskLabel } from "../data.js";

const labels = { low: "LOW RISK", typical: "TYPICAL", raised: "ELEVATED", high: "HIGH RISK" };

export function riskTone(percent) {
  const key = getRiskLabel(percent).toLowerCase();
  return { key, label: labels[key] };
}
