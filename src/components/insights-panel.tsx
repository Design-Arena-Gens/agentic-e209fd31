import { format } from "date-fns";
import type { Insight } from "@/types/market";

type InsightsPanelProps = {
  insights: Insight[];
  confidence: number;
  latestRsi: number | null;
  lastUpdated: number | null;
};

const severityStyles: Record<
  Insight["severity"],
  { badge: string; tag: string }
> = {
  bullish: {
    badge:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.25)]",
    tag: "text-emerald-300",
  },
  neutral: {
    badge:
      "border-slate-500/30 bg-slate-500/10 text-slate-200 shadow-[0_0_15px_rgba(148,163,184,0.25)]",
    tag: "text-slate-300",
  },
  bearish: {
    badge:
      "border-rose-500/30 bg-rose-500/10 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.25)]",
    tag: "text-rose-300",
  },
};

const formatTimestamp = (timestamp: number | null) => {
  if (!timestamp) return "—";
  try {
    return format(timestamp, "HH:mm:ss");
  } catch {
    return "—";
  }
};

const InsightsPanel = ({
  insights,
  confidence,
  latestRsi,
  lastUpdated,
}: InsightsPanelProps) => {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.35)] backdrop-blur">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">
            Agentic Insights
          </h2>
          <p className="text-sm text-slate-400">
            Confluence engine scanning price interactions and oscillator bias.
          </p>
        </div>

        <div className="space-y-2 text-right">
          <div className="rounded-xl border border-slate-700/60 bg-slate-900/70 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-slate-400">
              RSI
            </p>
            <p className="text-xl font-semibold text-slate-100">
              {latestRsi === null ? "—" : latestRsi.toFixed(2)}
            </p>
          </div>
          <p className="text-[11px] text-slate-500">
            Updated {formatTimestamp(lastUpdated)}
          </p>
        </div>
      </header>

      <div className="mb-5">
        <p className="mb-1 flex justify-between text-xs font-semibold uppercase tracking-wide text-slate-400">
          <span>Conviction</span>
          <span>{confidence.toFixed(0)}%</span>
        </p>
        <div className="h-2 w-full rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-sky-500 transition-all"
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>

      <ul className="space-y-4">
        {insights.map((insight) => (
          <li
            key={`${insight.title}-${insight.detail}`}
            className={`rounded-2xl border px-4 py-3 text-sm leading-relaxed ${severityStyles[insight.severity].badge}`}
          >
            <span className={`mb-2 block text-xs uppercase ${severityStyles[insight.severity].tag}`}>
              {insight.severity}
            </span>
            <p className="font-semibold text-slate-100">{insight.title}</p>
            <p className="mt-1 text-slate-200/80">{insight.detail}</p>
          </li>
        ))}

        {insights.length === 0 && (
          <li className="rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-4 text-sm text-slate-300">
            Waiting for sufficient data to generate actionable intelligence.
          </li>
        )}
      </ul>
    </section>
  );
};

export default InsightsPanel;

