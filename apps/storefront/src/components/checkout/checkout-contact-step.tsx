"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Button,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@/components/ui";
import type { CheckoutContactData } from "@/components/checkout/types";

const contactSchema = z.object({
  email: z.email("Enter a valid email address.").trim().toLowerCase(),
  phone: z
    .string()
    .trim()
    .refine((value) => value === "" || /^[+()\-\d\s.]{7,32}$/.test(value), {
      message: "Enter a valid phone number.",
    }),
});

type ContactFormValues = z.infer<typeof contactSchema>;

type CheckoutContactStepProps = {
  defaultValues: CheckoutContactData;
  disabled?: boolean;
  onSubmit: (values: CheckoutContactData) => Promise<void>;
};

export function CheckoutContactStep({
  defaultValues,
  disabled = false,
  onSubmit,
}: CheckoutContactStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<ContactFormValues>({
    defaultValues,
    mode: "onBlur",
    resolver: zodResolver(contactSchema),
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    if (isSubmitting || disabled) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({ email: values.email, phone: values.phone });
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <Form {...form}>
      <form className="grid gap-5" noValidate onSubmit={handleSubmit}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  autoComplete="email"
                  disabled={disabled || isSubmitting}
                  inputMode="email"
                  required
                  type="email"
                  {...field}
                />
              </FormControl>
              <FormDescription>A receipt is sent here after your order is placed.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone (optional)</FormLabel>
              <FormControl>
                <Input
                  autoComplete="tel"
                  disabled={disabled || isSubmitting}
                  inputMode="tel"
                  type="tel"
                  {...field}
                />
              </FormControl>
              <FormDescription>Used only if the carrier needs delivery context.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          className="w-fit"
          disabled={disabled}
          loading={isSubmitting}
          size="lg"
          type="submit"
        >
          Continue to delivery
        </Button>
      </form>
    </Form>
  );
}
