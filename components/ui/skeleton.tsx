import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

export function Skeleton({ className, rounded = 'sm', ...props }: SkeletonProps) {
  const roundedMap = { sm: 'rounded-[8px]', md: 'rounded-[12px]', lg: 'rounded-[16px]', full: 'rounded-full' };
  return (
    <div
      className={cn('skeleton', roundedMap[rounded], className)}
      {...props}
    />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('bg-[var(--bg-2)] border border-[var(--border)] rounded-[16px] p-5 space-y-3', className)}>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="pt-2 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-[var(--bg-2)] border border-[var(--border)] rounded-[8px]">
          <Skeleton className="h-9 w-9" rounded="full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-6 w-16" rounded="full" />
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}
