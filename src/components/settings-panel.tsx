import type { RsiSettings, SmoothingMethod } from "@/types/market";

type SettingsPanelProps = {
  settings: RsiSettings;
  onChange: (settings: RsiSettings) => void;
};

const smoothingOptions: { label: string; value: SmoothingMethod }[] = [
  { label: "Wilder (RMA)", value: "rma" },
  { label: "Exponential (EMA)", value: "ema" },
  { label: "Simple (SMA)", value: "sma" },
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const SettingsPanel = ({ settings, onChange }: SettingsPanelProps) => {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.35)] backdrop-blur">
      <header className="mb-4">
        <h2 className="text-lg font-semibold text-slate-100">
          RSI Intelligence
        </h2>
        <p className="text-sm text-slate-400">
          Tune oscillator sensitivity to align the agent with your playbook.
        </p>
      </header>

      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-300">
            Lookback Period
          </span>
          <input
            type="number"
            min={2}
            max={100}
            value={settings.period}
            onChange={(event) =>
              onChange({
                ...settings,
                period: clamp(Number(event.target.value), 2, 100),
              })
            }
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-300">
            Overbought Threshold
          </span>
          <input
            type="number"
            min={50}
            max={95}
            value={settings.overbought}
            onChange={(event) =>
              onChange({
                ...settings,
                overbought: clamp(Number(event.target.value), 50, 95),
              })
            }
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-300">
            Oversold Threshold
          </span>
          <input
            type="number"
            min={5}
            max={50}
            value={settings.oversold}
            onChange={(event) =>
              onChange({
                ...settings,
                oversold: clamp(Number(event.target.value), 5, 50),
              })
            }
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-300">
            Smoothing Model
          </span>
          <select
            value={settings.smoothing}
            onChange={(event) =>
              onChange({
                ...settings,
                smoothing: event.target.value as SmoothingMethod,
              })
            }
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
          >
            {smoothingOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="bg-slate-900 text-slate-100"
              >
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
};

export default SettingsPanel;

