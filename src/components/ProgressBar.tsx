export function ProgressBar({ value, className = "" }: { value: number; className?: string }) {
  const pct = Math.round(Math.min(Math.max(value, 0), 1) * 100);
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-[#e2e0dc] ${className}`}>
      <div
        className="h-full rounded-full bg-success transition-[width] duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
