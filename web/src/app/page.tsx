"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import MarketChart from "@/components/market-chart";
import MarketOverview from "@/components/market-overview";
import RsiChart from "@/components/rsi-chart";
import SettingsPanel from "@/components/settings-panel";
import LevelsPanel from "@/components/levels-panel";
import InsightsPanel from "@/components/insights-panel";
import { calculateRsiSeries, findLatestRsi } from "@/lib/indicators";
import { generateInsights } from "@/lib/analysis";
import type { DataPoint, MarketPayload, RsiSettings } from "@/types/market";

const defaultSettings: RsiSettings = {
  period: 14,
  overbought: 70,
  oversold: 30,
  smoothing: "rma",
};

export default function Home() {
  const [data, setData] = useState<MarketPayload | null>(null);
  const [settings, setSettings] = useState<RsiSettings>(defaultSettings);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const refreshMarket = useCallback(async () => {
    try {
      const response = await fetch("/api/market", { cache: "no-store" });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof payload?.error === "string"
            ? payload.error
            : "Failed to fetch market data",
        );
      }

      setData(payload as MarketPayload);
      setError(null);
      setLastUpdated(Date.now());
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "Unexpected error";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const intervalIds: number[] = [];

    const bootstrap = async () => {
      if (!cancelled) {
        await refreshMarket();
      }

      if (!cancelled) {
        const interval = window.setInterval(() => {
          refreshMarket();
        }, 60_000);
        intervalIds.push(interval);
      }
    };

    bootstrap();

    return () => {
      cancelled = true;
      intervalIds.forEach((interval) => window.clearInterval(interval));
    };
  }, [refreshMarket]);

  const rsiSeries = useMemo<DataPoint[]>(
    () => (data ? calculateRsiSeries(data.candles, settings) : []),
    [data, settings],
  );

  const { insights, confidence } = useMemo(() => {
    if (!data) return { insights: [], confidence: 0 };
    return generateInsights({
      candles: data.candles,
      levels: data.levels,
      openingRange: data.openingRange,
      rsiSeries,
      settings,
    });
  }, [data, rsiSeries, settings]);

  const latestRsi = useMemo(() => findLatestRsi(rsiSeries), [rsiSeries]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshMarket();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <span>Live market feed</span>
          </div>

          <button
            type="button"
            onClick={handleManualRefresh}
            className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-sky-500 hover:text-sky-200"
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isRefreshing ? "bg-sky-400" : "bg-slate-600"
              }`}
            />
            Refresh
          </button>
        </div>

        {error && (
          <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
            {error}
          </div>
        )}

        {data ? (
          <>
            <MarketOverview data={data} />

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="space-y-6 xl:col-span-2">
                <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
                    Price Action Matrix
                  </h2>
                  <MarketChart
                    candles={data.candles}
                    levels={data.levels}
                    openingRange={data.openingRange}
                  />
                </div>

                <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
                  <div className="mb-3 flex items-center justify-between text-sm text-slate-400">
                    <h2 className="font-semibold uppercase tracking-wide">
                      RSI Confluence
                    </h2>
                    <span>
                      {rsiSeries.length} datapoints ·{" "}
                      {settings.smoothing.toUpperCase()}
                    </span>
                  </div>
                  <RsiChart series={rsiSeries} settings={settings} />
                </div>
              </div>

              <div className="space-y-6">
                <SettingsPanel
                  settings={settings}
                  onChange={(updated) => setSettings(updated)}
                />
                <LevelsPanel
                  levels={data.levels}
                  openingRange={data.openingRange}
                />
                <InsightsPanel
                  insights={insights}
                  confidence={confidence}
                  latestRsi={latestRsi}
                  lastUpdated={lastUpdated}
                />
              </div>
            </section>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center rounded-3xl border border-slate-800 bg-slate-950/80 p-20 text-sm text-slate-400">
            {loading
              ? "Booting Nifty 50 intelligence engine..."
              : "No market data available."}
          </div>
        )}
      </div>
    </div>
  );
}
