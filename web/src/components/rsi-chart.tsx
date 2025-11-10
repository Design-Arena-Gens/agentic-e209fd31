/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useRef } from "react";
import {
  ColorType,
  LineSeries,
  LineStyle,
  createChart,
  type ISeriesApi,
  type LineData,
  type UTCTimestamp,
} from "lightweight-charts";
import type { DataPoint, RsiSettings } from "@/types/market";

type RsiChartProps = {
  series: DataPoint[];
  settings: RsiSettings;
};

const toLineData = (series: DataPoint[]): LineData[] =>
  series.map((point) => ({
    time: point.time as UTCTimestamp,
    value: Number(point.value.toFixed(2)),
  }));

const RsiChart = ({ series, settings }: RsiChartProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const lineSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const overlaysRef = useRef<ReturnType<ISeriesApi<"Line">["createPriceLine"]>[]>(
    [],
  );

  useEffect(() => {
    if (!containerRef.current || chartRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#020817" },
        textColor: "#E2E8F0",
      },
      grid: {
        vertLines: { color: "rgba(148, 163, 184, 0.15)", style: LineStyle.Dotted },
        horzLines: { color: "rgba(148, 163, 184, 0.15)", style: LineStyle.Dotted },
      },
      autoSize: true,
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: true, timeVisible: true, secondsVisible: false },
      crosshair: { mode: 1 },
    });

    const lineSeries = chart.addSeries(LineSeries, {
      color: "#38bdf8",
      lineWidth: 2,
    });

    chartRef.current = chart;
    lineSeriesRef.current = lineSeries;

    const observer = new ResizeObserver((entries) => {
      entries.forEach(({ contentRect }) => {
        chart.applyOptions({
          width: contentRect.width,
          height: contentRect.height,
        });
      });
    });

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      chartRef.current?.remove();
      chartRef.current = null;
      lineSeriesRef.current = null;
      overlaysRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (!lineSeriesRef.current) return;
    lineSeriesRef.current.setData(toLineData(series));
    chartRef.current?.timeScale().fitContent();
  }, [series]);

  const overlayLevels = useMemo(
    () => [
      {
        price: settings.overbought,
        color: "#f87171",
        title: `Overbought ${settings.overbought}`,
      },
      {
        price: settings.oversold,
        color: "#4ade80",
        title: `Oversold ${settings.oversold}`,
      },
      { price: 50, color: "#cbd5f5", title: "Midline 50" },
    ],
    [settings.overbought, settings.oversold],
  );

  useEffect(() => {
    if (!lineSeriesRef.current) return;

    overlaysRef.current.forEach((overlay) =>
      lineSeriesRef.current?.removePriceLine(overlay),
    );
    overlaysRef.current = [];

    overlayLevels.forEach((overlay) => {
      const line = lineSeriesRef.current?.createPriceLine({
        price: overlay.price,
        color: overlay.color,
        lineStyle: LineStyle.Dashed,
        lineWidth: 1,
        axisLabelVisible: true,
        title: overlay.title,
      });
      if (line) overlaysRef.current.push(line);
    });
  }, [overlayLevels]);

  return <div ref={containerRef} className="h-[220px] w-full" />;
};

export default RsiChart;
