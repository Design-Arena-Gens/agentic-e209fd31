/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useRef } from "react";
import {
  ColorType,
  LineStyle,
  PriceScaleMode,
  createChart,
  type IChartApi,
  type IPriceLine,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import type { Candle, Levels, OpeningRange } from "@/types/market";

type MarketChartProps = {
  candles: Candle[];
  levels: Levels;
  openingRange: OpeningRange;
};

const toCandleData = (candles: Candle[]) =>
  candles.map((candle) => ({
    time: Math.floor(candle.time / 1000) as UTCTimestamp,
    open: Number(candle.open.toFixed(2)),
    high: Number(candle.high.toFixed(2)),
    low: Number(candle.low.toFixed(2)),
    close: Number(candle.close.toFixed(2)),
  }));

const PriceChart = ({ candles, levels, openingRange }: MarketChartProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const priceLinesRef = useRef<IPriceLine[]>([]);

  useEffect(() => {
    if (!containerRef.current || chartRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#020817" },
        textColor: "#E2E8F0",
      },
      rightPriceScale: {
        borderVisible: false,
        mode: PriceScaleMode.Normal,
      },
      timeScale: {
        borderVisible: true,
        timeVisible: true,
        secondsVisible: false,
      },
      grid: {
        vertLines: { color: "rgba(148, 163, 184, 0.15)", style: LineStyle.Dotted },
        horzLines: { color: "rgba(148, 163, 184, 0.15)", style: LineStyle.Dotted },
      },
      autoSize: true,
      crosshair: {
        mode: 1,
      },
    });

    const series = chart.addCandlestickSeries({
      upColor: "#22c55e",
      downColor: "#ef4444",
      wickVisible: true,
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
      borderVisible: true,
      borderUpColor: "#16a34a",
      borderDownColor: "#dc2626",
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const { width, height } = entry.contentRect;
        chart.applyOptions({ width, height });
      });
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (seriesRef.current) {
        priceLinesRef.current.forEach((line) =>
          seriesRef.current?.removePriceLine(line),
        );
      }
      chartRef.current?.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current || candles.length === 0) return;
    seriesRef.current.setData(toCandleData(candles));
    chartRef.current?.timeScale().fitContent();
  }, [candles]);

  const priceLineConfig = useMemo(
    () => [
      ...levels.resistances.map((price, index) => ({
        price,
        color: "#f87171",
        title: `A${index + 1}`,
      })),
      ...levels.supports.map((price, index) => ({
        price,
        color: "#4ade80",
        title: `B${index + 1}`,
      })),
      {
        price: openingRange.high,
        color: "#fb923c",
        title: "Opening High",
      },
      {
        price: openingRange.low,
        color: "#38bdf8",
        title: "Opening Low",
      },
    ],
    [levels, openingRange],
  );

  useEffect(() => {
    if (!seriesRef.current) return;

    priceLinesRef.current.forEach((line) =>
      seriesRef.current?.removePriceLine(line),
    );
    priceLinesRef.current = [];

    priceLineConfig.forEach((config) => {
      const line = seriesRef.current?.createPriceLine({
        price: Number(config.price.toFixed(2)),
        color: config.color,
        lineStyle: LineStyle.Solid,
        lineWidth: 1,
        axisLabelVisible: true,
        title: config.title,
      });
      if (line) {
        priceLinesRef.current.push(line);
      }
    });
  }, [priceLineConfig]);

  return <div ref={containerRef} className="h-[420px] w-full" />;
};

export default PriceChart;

