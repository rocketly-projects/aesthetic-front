interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div className={`bg-bg-2 animate-pulse rounded-md ${className}`} />
  );
}

export function SkeletonTableRows({ cols = 5, rows = 8 }: { cols?: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="px-4 py-3 border-b border-line">
              <div className="h-4 bg-bg-2 animate-pulse rounded-md" style={{ width: c === 0 ? "60%" : c === cols - 1 ? "40%" : "80%" }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function SkeletonList({ rows = 8 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-bg">
          <div className="w-9 h-9 rounded-full bg-bg-2 animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 bg-bg-2 animate-pulse rounded-md" style={{ width: `${55 + (i % 3) * 15}%` }} />
            <div className="h-3 bg-bg-2 animate-pulse rounded-md" style={{ width: `${35 + (i % 4) * 10}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
