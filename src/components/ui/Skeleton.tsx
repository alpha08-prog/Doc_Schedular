import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  lines?: number;
  circle?: boolean;
}

export function Skeleton({ className, lines = 1, circle = false }: SkeletonProps) {
  if (lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "animate-pulse bg-gray-200 rounded",
              i === lines - 1 ? "w-3/4" : "w-full",
              "h-4",
              className
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn("animate-pulse bg-gray-200", circle ? "rounded-full" : "rounded", className)}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12" circle />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton lines={3} />
    </div>
  );
}
