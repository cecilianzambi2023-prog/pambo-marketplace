type LabelValue = string | number | boolean;

type Labels = Record<string, LabelValue>;

interface CounterEntry {
  key: string;
  value: number;
}

interface LatencyEntry {
  key: string;
  samples: number[];
}

const MAX_LATENCY_SAMPLES = 500;

const buildMetricKey = (name: string, labels?: Labels) => {
  if (!labels || Object.keys(labels).length === 0) return name;
  const sorted = Object.keys(labels)
    .sort()
    .map((label) => `${label}=${labels[label]}`)
    .join(',');
  return `${name}{${sorted}}`;
};

class ScaleMetrics {
  private counters = new Map<string, number>();
  private latencies = new Map<string, number[]>();
  private bootTimestamp = new Date().toISOString();

  increment(name: string, labels?: Labels, by: number = 1) {
    const key = buildMetricKey(name, labels);
    const current = this.counters.get(key) || 0;
    this.counters.set(key, current + by);
  }

  recordLatency(name: string, valueMs: number, labels?: Labels) {
    const key = buildMetricKey(name, labels);
    const list = this.latencies.get(key) || [];
    list.push(valueMs);
    if (list.length > MAX_LATENCY_SAMPLES) {
      list.splice(0, list.length - MAX_LATENCY_SAMPLES);
    }
    this.latencies.set(key, list);
  }

  snapshot() {
    const counters: CounterEntry[] = Array.from(this.counters.entries()).map(([key, value]) => ({ key, value }));
    const latencies: LatencyEntry[] = Array.from(this.latencies.entries()).map(([key, samples]) => ({ key, samples }));

    return {
      bootTimestamp: this.bootTimestamp,
      counters,
      latencies: latencies.map((entry) => {
        const sorted = [...entry.samples].sort((a, b) => a - b);
        const p95Index = Math.floor(sorted.length * 0.95);
        const p99Index = Math.floor(sorted.length * 0.99);
        return {
          key: entry.key,
          count: entry.samples.length,
          avgMs: entry.samples.length
            ? Number((entry.samples.reduce((sum, current) => sum + current, 0) / entry.samples.length).toFixed(2))
            : 0,
          p95Ms: sorted.length ? sorted[Math.min(p95Index, sorted.length - 1)] : 0,
          p99Ms: sorted.length ? sorted[Math.min(p99Index, sorted.length - 1)] : 0,
          maxMs: sorted.length ? sorted[sorted.length - 1] : 0,
        };
      }),
    };
  }
}

export const scaleMetrics = new ScaleMetrics();
