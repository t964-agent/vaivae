"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentRef,
  type HTMLAttributes,
} from "react";

import { cn } from "@/lib/utils";

const drawerSideClasses = {
  right: "inset-y-0 right-0 h-dvh w-full border-l sm:max-w-[420px]",
  left: "inset-y-0 left-0 h-dvh w-full border-r sm:max-w-[420px]",
  bottom: "inset-x-0 bottom-0 max-h-[80dvh] w-full border-t",
  top: "inset-x-0 top-0 max-h-[80dvh] w-full border-b",
} as const;

export type DrawerSide = keyof typeof drawerSideClasses;
export type DrawerProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Root>;
export type DrawerTriggerProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger>;
export type DrawerPortalProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Portal>;
export type DrawerOverlayProps = Omit<
  ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>,
  "asChild"
>;
export type DrawerContentProps = Omit<
  ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
  "asChild"
> & {
  /** Side from which the panel enters. */
  side?: DrawerSide;
  /** Renders the top-right close affordance. */
  showCloseButton?: boolean;
};
export type DrawerCloseProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Close>;

function getDrawerInitial(side: DrawerSide, reduceMotion: boolean) {
  if (reduceMotion) {
    return { opacity: 0 };
  }

  if (side === "right") {
    return { opacity: 1, x: "100%" };
  }

  if (side === "left") {
    return { opacity: 1, x: "-100%" };
  }

  if (side === "bottom") {
    return { opacity: 1, y: "100%" };
  }

  return { opacity: 1, y: "-100%" };
}

function getDrawerAnimate(reduceMotion: boolean) {
  return reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0, y: 0 };
}

/** Modal side sheet root built on Radix Dialog for focus trap and escape close. */
function Drawer(props: DrawerProps) {
  return <DialogPrimitive.Root {...props} />;
}
Drawer.displayName = "Drawer";

/** Element that opens the drawer. */
const DrawerTrigger = forwardRef<ComponentRef<typeof DialogPrimitive.Trigger>, DrawerTriggerProps>(
  function DrawerTrigger(props, ref) {
    return <DialogPrimitive.Trigger ref={ref} {...props} />;
  },
);
DrawerTrigger.displayName = "DrawerTrigger";

/** Portal target for drawer overlay and content. */
function DrawerPortal(props: DrawerPortalProps) {
  return <DialogPrimitive.Portal {...props} />;
}
DrawerPortal.displayName = "DrawerPortal";

/** Drawer backdrop. */
const DrawerOverlay = forwardRef<ComponentRef<typeof DialogPrimitive.Overlay>, DrawerOverlayProps>(
  function DrawerOverlay({ className, ...props }, ref) {
    const reduceMotion = useReducedMotion() === true;

    return (
      <DialogPrimitive.Overlay ref={ref} asChild {...props}>
        <motion.div
          animate={{ opacity: 1 }}
          className={cn("fixed inset-0 z-50 bg-ink/60 backdrop-blur-[2px]", className)}
          initial={reduceMotion ? false : { opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.16, ease: "easeOut" }}
        />
      </DialogPrimitive.Overlay>
    );
  },
);
DrawerOverlay.displayName = "DrawerOverlay";

/** Side-aware drawer panel for cart, mobile nav, and transient workflows. */
const DrawerContent = forwardRef<ComponentRef<typeof DialogPrimitive.Content>, DrawerContentProps>(
  function DrawerContent(
    { children, className, showCloseButton = true, side = "right", ...props },
    ref,
  ) {
    const reduceMotion = useReducedMotion() === true;

    return (
      <DrawerPortal>
        <DrawerOverlay />
        <DialogPrimitive.Content ref={ref} asChild {...props}>
          <motion.div
            animate={getDrawerAnimate(reduceMotion)}
            className={cn(
              "fixed z-50 overflow-y-auto border-on-light/10 bg-cream p-6 text-on-light shadow-fine outline-none sm:p-8",
              drawerSideClasses[side],
              className,
            )}
            data-side={side}
            initial={getDrawerInitial(side, reduceMotion)}
            transition={{ duration: reduceMotion ? 0 : 0.22, ease: "easeOut" }}
          >
            {showCloseButton ? (
              <DialogPrimitive.Close
                aria-label="Close"
                className="absolute top-4 right-4 inline-flex size-9 items-center justify-center rounded-full text-on-light/65 transition-colors hover:bg-on-light/5 hover:text-on-light focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-accent-gold"
              >
                <X aria-hidden className="size-4" />
              </DialogPrimitive.Close>
            ) : null}
            {children}
          </motion.div>
        </DialogPrimitive.Content>
      </DrawerPortal>
    );
  },
);
DrawerContent.displayName = "DrawerContent";

/** Layout wrapper for drawer title and description. */
const DrawerHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function DrawerHeader({ className, ...props }, ref) {
    return <div ref={ref} className={cn("grid gap-2 pr-8", className)} {...props} />;
  },
);
DrawerHeader.displayName = "DrawerHeader";

/** Drawer title wired to aria-labelledby by Radix. */
const DrawerTitle = forwardRef<
  ComponentRef<typeof DialogPrimitive.Title>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(function DrawerTitle({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Title
      ref={ref}
      className={cn(
        "font-display text-2xl leading-none font-light tracking-[-0.04em] italic",
        className,
      )}
      {...props}
    />
  );
});
DrawerTitle.displayName = "DrawerTitle";

/** Supporting drawer copy wired to aria-describedby by Radix. */
const DrawerDescription = forwardRef<
  ComponentRef<typeof DialogPrimitive.Description>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(function DrawerDescription({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn("text-sm leading-6 text-on-light/65", className)}
      {...props}
    />
  );
});
DrawerDescription.displayName = "DrawerDescription";

/** Action row for drawer controls. */
const DrawerFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function DrawerFooter({ className, ...props }, ref) {
    return <div ref={ref} className={cn("mt-8 grid gap-3", className)} {...props} />;
  },
);
DrawerFooter.displayName = "DrawerFooter";

/** Element that closes the drawer. */
const DrawerClose = forwardRef<ComponentRef<typeof DialogPrimitive.Close>, DrawerCloseProps>(
  function DrawerClose(props, ref) {
    return <DialogPrimitive.Close ref={ref} {...props} />;
  },
);
DrawerClose.displayName = "DrawerClose";

export {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
};
