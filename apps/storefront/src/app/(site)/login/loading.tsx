import { AuthShell } from "@/components/auth/AuthShell";
import { Skeleton, Stack } from "@/components/ui";

export default function LoginLoading() {
  return (
    <AuthShell
      body="Authentication is optional in Phase 1. Sign in when you want saved addresses, order history, and wishlist continuity."
      eyebrow="Account"
      title="A quieter return."
    >
      <Stack gap={4}>
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-12 w-32" />
      </Stack>
    </AuthShell>
  );
}
