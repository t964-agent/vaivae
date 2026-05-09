import { Skeleton } from "@/components/ui";

export default function OrderConfirmationLoading() {
  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
      <div className="grid gap-5 border-b border-on-light/10 pb-10">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-24 w-3/4" />
        <Skeleton className="h-16 w-full" />
      </div>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    </div>
  );
}
