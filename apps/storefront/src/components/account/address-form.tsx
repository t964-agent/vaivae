"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Button,
  Checkbox,
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

const addressFormSchema = z.object({
  address1: z.string().trim().min(1, "Enter a street address."),
  address2: z.string().trim(),
  city: z.string().trim().min(1, "Enter a city."),
  country: z.literal("US"),
  firstName: z.string().trim().min(1, "Enter a first name."),
  isDefaultBilling: z.boolean(),
  isDefaultShipping: z.boolean(),
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

export type AddressFormValues = z.infer<typeof addressFormSchema>;

type AddressFormProps = {
  buttonLabel: string;
  defaultValues: AddressFormValues;
  onSubmit: (values: AddressFormValues) => Promise<void>;
};

const selectClasses =
  "h-11 w-full rounded-none border border-on-light/20 bg-cream px-4 py-2 font-body text-sm text-on-light shadow-none transition-colors hover:border-on-light/35 focus:border-on-light/40 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-accent-gold disabled:cursor-not-allowed disabled:opacity-45 data-[invalid=true]:border-accent-red";

export const emptyAddressFormValues: AddressFormValues = {
  address1: "",
  address2: "",
  city: "",
  country: "US",
  firstName: "",
  isDefaultBilling: false,
  isDefaultShipping: false,
  lastName: "",
  phone: "",
  postalCode: "",
  state: "",
};

export function AddressForm({ buttonLabel, defaultValues, onSubmit }: AddressFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<AddressFormValues>({
    defaultValues,
    mode: "onBlur",
    resolver: zodResolver(addressFormSchema),
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    if (isSubmitting) {
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
        <fieldset className="grid gap-5" disabled={isSubmitting}>
          <legend className="sr-only">Saved address</legend>
          <input type="hidden" value="US" {...form.register("country")} />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input autoComplete="given-name" required {...field} />
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
                    <Input autoComplete="family-name" required {...field} />
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
                  <Input autoComplete="address-line1" required {...field} />
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
                  <Input autoComplete="address-line2" {...field} />
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
                    <Input autoComplete="address-level2" required {...field} />
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
                      autoComplete="address-level1"
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
                    <Input autoComplete="postal-code" inputMode="numeric" required {...field} />
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
                    <Input autoComplete="tel" inputMode="tel" type="tel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-3 border-t border-on-light/10 pt-5">
            <FormField
              control={form.control}
              name="isDefaultShipping"
              render={({ field }) => (
                <FormItem className="gap-2">
                  <div className="flex items-start gap-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(value) => field.onChange(value === true)}
                      />
                    </FormControl>
                    <FormLabel className="text-sm leading-5 font-normal tracking-normal text-on-light/68 normal-case">
                      Use as default shipping address
                    </FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isDefaultBilling"
              render={({ field }) => (
                <FormItem className="gap-2">
                  <div className="flex items-start gap-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(value) => field.onChange(value === true)}
                      />
                    </FormControl>
                    <FormLabel className="text-sm leading-5 font-normal tracking-normal text-on-light/68 normal-case">
                      Use as default billing address
                    </FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </fieldset>

        <Button className="w-fit" loading={isSubmitting} size="lg" type="submit">
          {buttonLabel}
        </Button>
      </form>
    </Form>
  );
}
