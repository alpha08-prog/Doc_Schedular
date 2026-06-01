import { CardSkeleton } from "@/components/ui/Skeleton";

export default function PatientLoading() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 px-4 pt-8">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
