export type Candle = {
  time: number; // epoch milliseconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type OpeningRange = {
  high: number;
  low: number;
  start: number;
  end: number;
};

export type Levels = {
  resistances: number[];
  supports: number[];
};

export type MarketSummary = {
  last: number;
  change: number;
};

export type MarketPayload = {
  symbol: string;
  openingRange: OpeningRange;
  levels: Levels;
  market: MarketSummary;
  candles: Candle[];
  timestamp: number;
};

export type SmoothingMethod = "rma" | "ema" | "sma";

export type RsiSettings = {
  period: number;
  overbought: number;
  oversold: number;
  smoothing: SmoothingMethod;
};

export type DataPoint = {
  time: number;
  value: number;
};

export type Insight = {
  title: string;
  detail: string;
  severity: "bullish" | "bearish" | "neutral";
};

