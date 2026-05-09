"use client";

import { useId, useState, type FormEvent } from "react";

import type { CheckoutShippingOption } from "@/components/checkout/types";
import { Button } from "@/components/ui";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

type CheckoutShippingMethodStepProps = {
  currencyCode: string;
  disabled?: boolean;
  onSubmit: (optionId: string) => Promise<void>;
  options: CheckoutShippingOption[];
  selectedOptionId: string | null;
};

function getShippingPrice(option: CheckoutShippingOption, currencyCode: string): string {
  const calculatedAmount = option.calculated_price?.calculated_amount;
  const amount = typeof calculatedAmount === "number" ? calculatedAmount : option.amount;

  if (amount === 0) {
    return "Complimentary";
  }

  return formatPrice(amount, currencyCode);
}

function getShippingDescription(option: CheckoutShippingOption): string {
  return option.type?.description?.trim() || "Ships once the order is prepared.";
}

export function CheckoutShippingMethodStep({
  currencyCode,
  disabled = false,
  onSubmit,
  options,
  selectedOptionId,
}: CheckoutShippingMethodStepProps) {
  const groupId = useId();
  const [selectedId, setSelectedId] = useState(selectedOptionId ?? options[0]?.id ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canSubmit = Boolean(selectedId) && !disabled && !isSubmitting;

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(selectedId);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (options.length === 0) {
    return (
      <div className="grid gap-4 rounded-[2px] border border-on-light/10 bg-on-light/[0.03] p-5">
        <p className="text-sm leading-6 text-on-light/65">
          No delivery methods are available for this address yet. Review the address, then try
          again.
        </p>
      </div>
    );
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <fieldset className="grid gap-3" disabled={disabled || isSubmitting}>
        <legend className="sr-only">Select a shipping method</legend>
        {options.map((option) => {
          const inputId = `${groupId}-${option.id}`;
          const isSelected = selectedId === option.id;
          const isDisabled = option.insufficient_inventory || disabled || isSubmitting;

          return (
            <label
              className={cn(
                "grid cursor-pointer gap-2 border p-4 transition-colors",
                isSelected
                  ? "border-oxblood bg-on-light/[0.04]"
                  : "border-on-light/12 hover:border-on-light/28",
                isDisabled ? "cursor-not-allowed opacity-45" : null,
              )}
              htmlFor={inputId}
              key={option.id}
            >
              <span className="flex items-start justify-between gap-4">
                <span className="flex items-start gap-3">
                  <input
                    checked={isSelected}
                    className="mt-1 size-4 accent-oxblood"
                    disabled={isDisabled}
                    id={inputId}
                    name="shipping-option"
                    onChange={() => setSelectedId(option.id)}
                    type="radio"
                    value={option.id}
                  />
                  <span>
                    <span className="block text-sm font-medium text-on-light">{option.name}</span>
                    <span className="mt-1 block text-sm leading-5 text-on-light/60">
                      {getShippingDescription(option)}
                    </span>
                  </span>
                </span>
                <span className="text-sm text-on-light tabular-nums">
                  {getShippingPrice(option, currencyCode)}
                </span>
              </span>
              {option.insufficient_inventory ? (
                <span className="text-sm text-accent-red">
                  Insufficient inventory for this method.
                </span>
              ) : null}
            </label>
          );
        })}
      </fieldset>

      <Button
        className="w-fit"
        disabled={!canSubmit}
        loading={isSubmitting}
        size="lg"
        type="submit"
      >
        Continue to payment
      </Button>
    </form>
  );
}
