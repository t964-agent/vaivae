import { Skeleton, Stack } from "@/components/ui";

export function AccountLoadingState() {
  return (
    <Stack gap={6}>
      <Skeleton className="h-12 w-full max-w-sm" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
      <Skeleton className="h-64 w-full" />
    </Stack>
  );
}
