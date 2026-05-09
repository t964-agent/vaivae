import { Skeleton } from "@/components/ui";

export default function CheckoutLoading() {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-12 lg:px-10 lg:py-12">
      <div className="grid gap-6">
        <Skeleton className="h-16 w-2/3" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
      <Skeleton className="hidden h-96 w-full lg:block" />
    </div>
  );
}
