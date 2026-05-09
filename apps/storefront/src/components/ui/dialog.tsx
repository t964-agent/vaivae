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

export type DialogProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Root>;
export type DialogTriggerProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger>;
export type DialogPortalProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Portal>;
export type DialogOverlayProps = Omit<
  ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>,
  "asChild"
>;
export type DialogContentProps = Omit<
  ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
  "asChild"
> & {
  /** Renders the top-right close affordance. */
  showCloseButton?: boolean;
};
export type DialogCloseProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Close>;

/** Modal dialog root with Radix focus trapping and escape-key behavior. */
function Dialog(props: DialogProps) {
  return <DialogPrimitive.Root {...props} />;
}
Dialog.displayName = "Dialog";

/** Element that opens the dialog. */
const DialogTrigger = forwardRef<ComponentRef<typeof DialogPrimitive.Trigger>, DialogTriggerProps>(
  function DialogTrigger(props, ref) {
    return <DialogPrimitive.Trigger ref={ref} {...props} />;
  },
);
DialogTrigger.displayName = "DialogTrigger";

/** Portal target for dialog overlay and content. */
function DialogPortal(props: DialogPortalProps) {
  return <DialogPrimitive.Portal {...props} />;
}
DialogPortal.displayName = "DialogPortal";

/** Brand-tinted backdrop for modal dialogs. */
const DialogOverlay = forwardRef<ComponentRef<typeof DialogPrimitive.Overlay>, DialogOverlayProps>(
  function DialogOverlay({ className, ...props }, ref) {
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
DialogOverlay.displayName = "DialogOverlay";

/** Dialog panel on a cream surface with subtle reduced-motion aware entrance. */
const DialogContent = forwardRef<ComponentRef<typeof DialogPrimitive.Content>, DialogContentProps>(
  function DialogContent({ children, className, showCloseButton = true, ...props }, ref) {
    const reduceMotion = useReducedMotion() === true;

    return (
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content ref={ref} asChild {...props}>
          <motion.div
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            className={cn(
              "fixed top-1/2 left-1/2 z-50 grid w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-6 border border-on-light/10 bg-cream p-6 text-on-light shadow-fine outline-none sm:p-8",
              className,
            )}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 12 }}
            transition={{ duration: reduceMotion ? 0 : 0.18, ease: "easeOut" }}
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
      </DialogPortal>
    );
  },
);
DialogContent.displayName = "DialogContent";

/** Layout wrapper for dialog title and description. */
const DialogHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function DialogHeader({ className, ...props }, ref) {
    return <div ref={ref} className={cn("grid gap-2 pr-8", className)} {...props} />;
  },
);
DialogHeader.displayName = "DialogHeader";

/** Dialog title wired to aria-labelledby by Radix. */
const DialogTitle = forwardRef<
  ComponentRef<typeof DialogPrimitive.Title>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(function DialogTitle({ className, ...props }, ref) {
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
DialogTitle.displayName = "DialogTitle";

/** Supporting dialog copy wired to aria-describedby by Radix. */
const DialogDescription = forwardRef<
  ComponentRef<typeof DialogPrimitive.Description>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(function DialogDescription({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn("text-sm leading-6 text-on-light/65", className)}
      {...props}
    />
  );
});
DialogDescription.displayName = "DialogDescription";

/** Action row for dialog controls. */
const DialogFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function DialogFooter({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col-reverse gap-3 sm:flex-row sm:justify-end", className)}
        {...props}
      />
    );
  },
);
DialogFooter.displayName = "DialogFooter";

/** Element that closes the dialog. */
const DialogClose = forwardRef<ComponentRef<typeof DialogPrimitive.Close>, DialogCloseProps>(
  function DialogClose(props, ref) {
    return <DialogPrimitive.Close ref={ref} {...props} />;
  },
);
DialogClose.displayName = "DialogClose";

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
