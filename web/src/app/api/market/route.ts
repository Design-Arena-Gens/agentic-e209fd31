import { NextResponse } from "next/server";

type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

const YAHOO_ENDPOINT =
  "https://query1.finance.yahoo.com/v8/finance/chart/%5ENSEI?range=1d&interval=1m&includePrePost=false&events=div%2Csplits%2CcapitalGains";

const LEVEL_INCREMENTS = [0.0009, 0.0018, 0.0036, 0.0072] as const;

const sanitizeNumber = (value: number | null | undefined) =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

const toCandles = (payload: any): Candle[] => {
  if (!payload) return [];

  const timestamps: number[] = payload?.timestamp ?? [];
  const indicators = payload?.indicators?.quote?.[0] ?? {};
  const opens: (number | null)[] = indicators?.open ?? [];
  const highs: (number | null)[] = indicators?.high ?? [];
  const lows: (number | null)[] = indicators?.low ?? [];
  const closes: (number | null)[] = indicators?.close ?? [];
  const volumes: (number | null)[] = indicators?.volume ?? [];

  const candles: Candle[] = [];

  for (let index = 0; index < timestamps.length; index += 1) {
    const open = sanitizeNumber(opens[index]);
    const high = sanitizeNumber(highs[index]);
    const low = sanitizeNumber(lows[index]);
    const close = sanitizeNumber(closes[index]);
    const volume = sanitizeNumber(volumes[index]);

    if (
      open === null ||
      high === null ||
      low === null ||
      close === null ||
      volume === null
    ) {
      continue;
    }

    candles.push({
      time: timestamps[index] * 1000,
      open,
      high,
      low,
      close,
      volume,
    });
  }

  return candles;
};

const buildLevels = (base: number, increments = LEVEL_INCREMENTS) => {
  const levels: number[] = [];
  let previous = base;

  increments.forEach((increment) => {
    previous = previous + previous * increment;
    levels.push(previous);
  });

  return levels;
};

const buildSupportLevels = (base: number, increments = LEVEL_INCREMENTS) => {
  const levels: number[] = [];
  let previous = base;

  increments.forEach((increment) => {
    previous = previous - previous * increment;
    levels.push(previous);
  });

  return levels;
};

export async function GET() {
  try {
    const response = await fetch(YAHOO_ENDPOINT, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        `Upstream request failed with status ${response.status}`,
      );
    }

    const json = await response.json();
    const result = json?.chart?.result?.[0];

    if (!result) {
      throw new Error("Unexpected response structure, missing result payload");
    }

    const candles = toCandles(result);

    if (candles.length === 0) {
      throw new Error("No candles available for NSE:NIFTY");
    }

    const firstFive = candles.slice(0, 5);

    if (firstFive.length < 5) {
      throw new Error("Incomplete opening range data");
    }

    const openingHigh = Math.max(...firstFive.map((candle) => candle.high));
    const openingLow = Math.min(...firstFive.map((candle) => candle.low));

    const resistanceLevels = buildLevels(openingHigh);
    const supportLevels = buildSupportLevels(openingLow);

    const latest = candles[candles.length - 1];

    return NextResponse.json(
      {
        symbol: "NSE:NIFTY",
        openingRange: {
          high: openingHigh,
          low: openingLow,
          start: firstFive[0].time,
          end: firstFive[firstFive.length - 1].time,
        },
        levels: {
          resistances: resistanceLevels,
          supports: supportLevels,
        },
        market: {
          last: latest.close,
          change: latest.close - candles[Math.max(0, candles.length - 2)].close,
        },
        candles,
        timestamp: Date.now(),
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error("[api/market] Error:", error);
    return NextResponse.json(
      { error: (error as Error).message ?? "Failed to load market data" },
      { status: 500 },
    );
  }
}

