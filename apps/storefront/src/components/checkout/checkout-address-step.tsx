"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { CheckoutAddressData } from "@/components/checkout/types";
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Label,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import { isUsStateCode, US_STATES } from "@/lib/us-states";

const addressSchema = z.object({
  address1: z.string().trim().min(1, "Enter a street address."),
  address2: z.string().trim(),
  city: z.string().trim().min(1, "Enter a city."),
  country: z.literal("US"),
  firstName: z.string().trim().min(1, "Enter a first name."),
  lastName: z.string().trim().min(1, "Enter a last name."),
  phone: z
    .string()
    .trim()
    .refine((value) => value === "" || /^[+()\-\d\s.]{7,32}$/.test(value), {
      message: "Enter a valid phone number.",
    }),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{5}(?:-\d{4})?$/, "Enter a ZIP code in the format 12345 or 12345-6789."),
  state: z
    .string()
    .trim()
    .transform((value) => value.toUpperCase())
    .refine(isUsStateCode, "Select a US state."),
});

type AddressFormValues = z.infer<typeof addressSchema>;

type CheckoutAddressStepProps = {
  buttonLabel?: string;
  defaultValues: CheckoutAddressData;
  disabled?: boolean;
  legend: string;
  onSubmit: (values: CheckoutAddressData) => Promise<void>;
  scope: "shipping" | "billing";
};

const selectClasses =
  "h-11 w-full rounded-none border border-on-light/20 bg-cream px-4 py-2 font-body text-sm text-on-light shadow-none transition-colors hover:border-on-light/35 focus:border-on-light/40 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-accent-gold disabled:cursor-not-allowed disabled:opacity-45 data-[invalid=true]:border-accent-red";

function getAutocomplete(scope: CheckoutAddressStepProps["scope"], field: string): string {
  return `${scope} ${field}`;
}

export function CheckoutAddressStep({
  buttonLabel = "Continue",
  defaultValues,
  disabled = false,
  legend,
  onSubmit,
  scope,
}: CheckoutAddressStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<AddressFormValues>({
    defaultValues,
    mode: "onBlur",
    resolver: zodResolver(addressSchema),
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    if (isSubmitting || disabled) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        ...values,
        address2: values.address2.trim(),
        country: "US",
        phone: values.phone.trim(),
        state: values.state.toUpperCase(),
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <Form {...form}>
      <form className="grid gap-6" noValidate onSubmit={handleSubmit}>
        <fieldset className="grid gap-5" disabled={disabled || isSubmitting}>
          <legend className="sr-only">{legend}</legend>
          <input type="hidden" value="US" {...form.register("country")} />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete={getAutocomplete(scope, "given-name")}
                      required
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete={getAutocomplete(scope, "family-name")}
                      required
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="address1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street address</FormLabel>
                <FormControl>
                  <Input
                    autoComplete={getAutocomplete(scope, "address-line1")}
                    required
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apartment, suite, etc. (optional)</FormLabel>
                <FormControl>
                  <Input autoComplete={getAutocomplete(scope, "address-line2")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-5 sm:grid-cols-[1fr_8rem_10rem]">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete={getAutocomplete(scope, "address-level2")}
                      required
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <select
                      autoComplete={getAutocomplete(scope, "address-level1")}
                      className={cn(selectClasses, fieldState.error ? "border-accent-red" : null)}
                      data-invalid={fieldState.error ? "true" : undefined}
                      required
                      {...field}
                    >
                      <option value="">Select</option>
                      {US_STATES.map((state) => (
                        <option key={state.code} value={state.code}>
                          {state.code}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ZIP code</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete={getAutocomplete(scope, "postal-code")}
                      inputMode="numeric"
                      required
                      type="text"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Country</Label>
              <div className="flex h-11 items-center border border-on-light/15 bg-on-light/[0.03] px-4 text-sm text-on-light/70">
                United States
              </div>
            </div>

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone (optional)</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete={getAutocomplete(scope, "tel")}
                      inputMode="tel"
                      type="tel"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </fieldset>

        <Button
          className="w-fit"
          disabled={disabled}
          loading={isSubmitting}
          size="lg"
          type="submit"
        >
          {buttonLabel}
        </Button>
      </form>
    </Form>
  );
}
