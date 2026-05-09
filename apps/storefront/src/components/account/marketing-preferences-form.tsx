"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState, useTransition } from "react";
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
  Stack,
} from "@/components/ui";
import { toast } from "@/lib/toast";
import { updateMarketingPreferencesAction } from "@/medusa/account-actions";

const marketingPreferencesSchema = z.object({
  subscribed: z.boolean(),
});

type MarketingPreferencesValues = z.infer<typeof marketingPreferencesSchema>;

type MarketingPreferencesFormProps = {
  initialSubscribed?: boolean;
};

export function MarketingPreferencesForm({
  initialSubscribed = false,
}: MarketingPreferencesFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const form = useForm<MarketingPreferencesValues>({
    defaultValues: { subscribed: initialSubscribed },
    resolver: zodResolver(marketingPreferencesSchema),
  });

  function onSubmit(values: MarketingPreferencesValues): void {
    setError(null);
    startTransition(() => {
      void updateMarketingPreferencesAction(values).then((result) => {
        if (!result.ok) {
          setError(result.error);
          return;
        }

        toast.success("Your preference has been noted");
      });
    });
  }

  return (
    <Stack gap={6}>
      <div className="grid gap-2">
        <h2 className="font-display text-4xl leading-none font-light tracking-[-0.05em] text-on-light italic">
          Marketing preferences
        </h2>
        <p className="text-sm leading-6 text-on-light/60">
          Editorial updates are opt-in. Durable consent storage arrives with Agent 20.
        </p>
      </div>

      <Form {...form}>
        <form className="grid gap-5" noValidate onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="subscribed"
            render={({ field }) => (
              <FormItem className="gap-2">
                <div className="flex items-start gap-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      disabled={isPending}
                      onCheckedChange={(value) => field.onChange(value === true)}
                    />
                  </FormControl>
                  <FormLabel className="text-sm leading-5 font-normal tracking-normal text-on-light/68 normal-case">
                    Receive vaïvae editorial updates
                  </FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <p className="text-xs leading-5 text-on-light/50">
            We process consent in line with our{" "}
            <Link
              className="text-on-light underline underline-offset-4 hover:text-oxblood"
              href="/privacy"
            >
              Privacy Policy
            </Link>
            .
          </p>

          <Button className="w-fit" loading={isPending} size="lg" type="submit">
            Save preference
          </Button>

          {error ? (
            <p
              aria-live="polite"
              className="border-l border-accent-red pl-3 text-sm leading-6 text-on-light"
              role="alert"
            >
              {error}
            </p>
          ) : null}
        </form>
      </Form>
    </Stack>
  );
}
