import { format } from "date-fns";
import type { MarketPayload } from "@/types/market";

type MarketOverviewProps = {
  data: MarketPayload;
};

const MarketOverview = ({ data }: MarketOverviewProps) => {
  const change = data.market.change;
  const changePercent = (change / (data.market.last - change || 1)) * 100;
  const isPositive = change >= 0;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8 shadow-[0_40px_120px_rgba(8,47,73,0.45)]">
      <div className="absolute inset-0 opacity-40 blur-3xl">
        <div className="absolute -top-20 -right-16 h-56 w-56 rounded-full bg-sky-500/30" />
        <div className="absolute -bottom-24 -left-10 h-60 w-60 rounded-full bg-emerald-500/20" />
      </div>

      <div className="relative z-10 flex flex-wrap items-end justify-between gap-8">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
            Agentic Trading Suite
          </p>
          <h1 className="mt-2 text-4xl font-semibold text-slate-100">
            Nifty 50 AI Playbook
          </h1>
          <p className="mt-3 text-sm text-slate-400">
            Live market context powered by opening range geometry and RSI
            confluence.
          </p>
        </div>

        <div className="flex items-end gap-6">
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Last Price
            </p>
            <p className="text-4xl font-semibold text-slate-100 tabular-nums">
              {data.market.last.toFixed(2)}
            </p>
            <p
              className={`text-sm font-medium tabular-nums ${
                isPositive ? "text-emerald-300" : "text-rose-300"
              }`}
            >
              {isPositive ? "+" : ""}
              {change.toFixed(2)} ({isPositive ? "+" : ""}
              {changePercent.toFixed(2)}%)
            </p>
          </div>

          <div className="rounded-2xl border border-slate-700/60 bg-slate-900/70 px-4 py-3 text-right">
            <p className="text-[11px] uppercase tracking-wider text-slate-400">
              Opening Range
            </p>
            <p className="text-sm text-amber-300">
              High {data.openingRange.high.toFixed(2)}
            </p>
            <p className="text-sm text-sky-300">
              Low {data.openingRange.low.toFixed(2)}
            </p>
            <p className="text-[11px] text-slate-500">
              {format(data.openingRange.start, "HH:mm")} —{" "}
              {format(data.openingRange.end, "HH:mm")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MarketOverview;

