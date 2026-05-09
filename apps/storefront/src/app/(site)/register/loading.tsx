import { AuthShell } from "@/components/auth/AuthShell";
import { Skeleton, Stack } from "@/components/ui";

export default function RegisterLoading() {
  return (
    <AuthShell
      body="Guest checkout remains primary. Create an account only if saved addresses, history, and wishlist continuity are useful."
      eyebrow="Account"
      title="Keep the thread."
    >
      <Stack gap={4}>
        <Skeleton className="h-9 w-48" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-12 w-40" />
      </Stack>
    </AuthShell>
  );
}
