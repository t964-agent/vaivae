"use client";

import { Heart } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { addToWishlistAction, removeFromWishlistAction } from "@/medusa/account-actions";

type WishlistToggleButtonProps = {
  initialIsInWishlist: boolean;
  initialWishlistItemId?: string | null | undefined;
  isAuthenticated: boolean;
  variantId: string | null;
};

export function WishlistToggleButton({
  initialIsInWishlist,
  initialWishlistItemId,
  isAuthenticated,
  variantId,
}: WishlistToggleButtonProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isInWishlist, setIsInWishlist] = useState(initialIsInWishlist);
  const [wishlistItemId, setWishlistItemId] = useState(initialWishlistItemId ?? null);
  const [isPending, startTransition] = useTransition();

  function getNextPath(): string {
    const query = searchParams.toString();

    return query ? `${pathname}?${query}` : pathname;
  }

  function redirectToLogin(): void {
    const loginUrl = `/login?next=${encodeURIComponent(getNextPath())}&action=wishlist`;

    router.push(loginUrl);
  }

  function handleToggle(): void {
    if (!variantId) {
      toast.info("Select a size and color before saving.");
      return;
    }

    if (!isAuthenticated) {
      redirectToLogin();
      return;
    }

    startTransition(() => {
      if (isInWishlist && wishlistItemId) {
        void removeFromWishlistAction(wishlistItemId).then((result) => {
          if (!result.ok) {
            toast.error(result.error);
            return;
          }

          setIsInWishlist(false);
          setWishlistItemId(null);
          toast.success("Removed from wishlist");
          router.refresh();
        });
        return;
      }

      void addToWishlistAction(variantId).then((result) => {
        if (!result.ok) {
          toast.error(result.error);
          return;
        }

        setIsInWishlist(true);
        setWishlistItemId(result.data.id);
        toast.success("Saved to wishlist");
        router.refresh();
      });
    });
  }

  return (
    <Button
      aria-label={
        isInWishlist ? "Remove selected variant from wishlist" : "Add selected variant to wishlist"
      }
      aria-pressed={isInWishlist}
      className={cn("w-full", isInWishlist ? "border-b-oxblood text-oxblood" : null)}
      disabled={isPending}
      onClick={handleToggle}
      type="button"
      variant="underline"
    >
      <Heart
        aria-hidden
        className="size-4"
        fill={isInWishlist ? "currentColor" : "none"}
        strokeWidth={1.8}
      />
      {isInWishlist ? "Saved to wishlist" : "Add to wishlist"}
    </Button>
  );
}
