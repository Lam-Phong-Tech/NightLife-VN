import { HomeLoadingSkeleton } from "@/components/ui/LoadingSkeleton";

export default function Loading() {
  return (
    <>
      <div className="block md:hidden">
        <HomeLoadingSkeleton mobile />
      </div>
      <div className="hidden md:block">
        <HomeLoadingSkeleton />
      </div>
    </>
  );
}
