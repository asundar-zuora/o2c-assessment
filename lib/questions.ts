export const QUESTIONS = [
  { id: "q1", title: "How well does your current order-to-cash or quote-to-cash tech stack support your ability to act as a strategic advisor?", options: [
    { label: "Fully supports my role — I have the tools and data I need", value: 4 },
    { label: "Somewhat supports, but I still face gaps", value: 3 },
    { label: "Rarely supports — manual work limits my impact", value: 2 },
    { label: "Doesn’t support at all — systems actively hold us back", value: 1 },
  ]},
  // ... replicate the 8 questions you showed (q2..q8) with values 1–4
];

export function scoreToPercent(v: number) {
  // v is 1..4 → map to 0..100
  return Math.round(((v - 1) / 3) * 100);
}
export function classify(pct: number) {
  if (pct >= 75) return "Leader";
  if (pct >= 50) return "Advancing";
  if (pct >= 25) return "Developing";
  return "Foundational";
}
