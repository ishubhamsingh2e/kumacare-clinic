import { EventColor } from "./types";

export const eventColors: Record<
  EventColor,
  { background: string; foreground: string }
> = {
  sky: {
    background: "oklch(0.89 0.05 230.13)",
    foreground: "oklch(0.19 0.05 230.13)",
  },
  amber: {
    background: "oklch(0.89 0.07 70.13)",
    foreground: "oklch(0.19 0.07 70.13)",
  },
  violet: {
    background: "oklch(0.89 0.05 300.13)",
    foreground: "oklch(0.19 0.05 300.13)",
  },
  rose: {
    background: "oklch(0.89 0.08 340.13)",
    foreground: "oklch(0.19 0.08 340.13)",
  },
  emerald: {
    background: "oklch(0.89 0.07 140.13)",
    foreground: "oklch(0.19 0.07 140.13)",
  },
  orange: {
    background: "oklch(0.89 0.09 50.13)",
    foreground: "oklch(0.19 0.09 50.13)",
  },
};

export const eventColorNames = Object.keys(eventColors) as EventColor[];
