import type { Levels, OpeningRange } from "@/types/market";

type LevelsPanelProps = {
  levels: Levels;
  openingRange: OpeningRange;
};

const labelMap = ["1", "2", "3", "4"];

const LevelsPanel = ({ levels, openingRange }: LevelsPanelProps) => {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.35)] backdrop-blur">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">
            Opening Range Levels
          </h2>
          <p className="text-sm text-slate-400">
            Auto-derived from the first five-minute candle.
          </p>
        </div>
        <div className="rounded-full border border-slate-700 bg-slate-950/70 px-4 py-2 text-right">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Opening Prints
          </p>
          <p className="text-sm text-amber-300">
            H {openingRange.high.toFixed(2)}
          </p>
          <p className="text-sm text-sky-300">
            L {openingRange.low.toFixed(2)}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-rose-300/80">
            Resistances
          </p>
          <ul className="space-y-2">
            {levels.resistances.map((level, index) => (
              <li
                key={`res-${level}-${index}`}
                className="flex items-center justify-between rounded-xl border border-rose-500/20 bg-rose-500/5 px-3 py-2 text-rose-200"
              >
                <span className="font-medium">A{labelMap[index]}</span>
                <span className="tabular-nums">{level.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-300/80">
            Supports
          </p>
          <ul className="space-y-2">
            {levels.supports.map((level, index) => (
              <li
                key={`sup-${level}-${index}`}
                className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-emerald-200"
              >
                <span className="font-medium">B{labelMap[index]}</span>
                <span className="tabular-nums">{level.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default LevelsPanel;

