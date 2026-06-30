interface ScoreGaugeProps {
  label: string;
  score: number;
  max?: number;
}

export function ScoreGauge({ label, score, max = 10 }: ScoreGaugeProps) {
  const pct = Math.min(100, (score / max) * 100);
  const color =
    score >= 8 ? "bg-emerald-500" : score >= 6 ? "bg-amber-500" : "bg-rose-500";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="font-mono font-semibold text-white">
          {score.toFixed(1)}/{max}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
