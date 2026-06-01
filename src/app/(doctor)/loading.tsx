import { CardSkeleton } from "@/components/ui/Skeleton";

export default function DoctorLoading() {
  return (
    <div className="px-4 py-6 max-w-7xl mx-auto space-y-4">
      <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
            <div className="h-4 w-24 bg-gray-200 rounded mb-3" />
            <div className="h-8 w-16 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
}
