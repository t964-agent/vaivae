"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Button,
  Checkbox,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@/components/ui";
import { subscribeNewsletterAction, type NewsletterActionResult } from "@/lib/marketing/actions";

const newsletterFormSchema = z.object({
  consent: z
    .boolean()
    .pipe(z.literal(true, { error: "Please confirm you want to receive the editorial." })),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
});

type NewsletterFormInput = z.input<typeof newsletterFormSchema>;
type NewsletterFormOutput = z.output<typeof newsletterFormSchema>;

export type NewsletterSignupFormProps = {
  submitLabel?: string | null;
};

export function NewsletterSignupForm({ submitLabel }: NewsletterSignupFormProps) {
  const reduceMotion = useReducedMotion() === true;
  const [result, setResult] = useState<NewsletterActionResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const form = useForm<NewsletterFormInput, unknown, NewsletterFormOutput>({
    defaultValues: {
      consent: false,
      email: "",
    },
    resolver: zodResolver(newsletterFormSchema),
  });

  const onSubmit = (values: NewsletterFormOutput) => {
    setResult(null);
    startTransition(() => {
      void subscribeNewsletterAction(values).then((actionResult) => {
        setResult(actionResult);

        if (actionResult.ok) {
          form.reset({ consent: false, email: "" });
        }
      });
    });
  };

  if (result?.ok) {
    return (
      <motion.p
        animate={{ opacity: 1, y: 0 }}
        className="max-w-sm border-l border-accent-gold pl-4 font-body text-sm leading-6 text-on-dark/80"
        initial={reduceMotion ? false : { opacity: 0, y: 4 }}
        role="status"
        transition={{ duration: reduceMotion ? 0 : 0.18, ease: "easeOut" }}
      >
        You&apos;re in. The next chapter arrives soon.
      </motion.p>
    );
  }

  return (
    <Form {...form}>
      <form className="grid max-w-xl gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-on-dark/65">Email</FormLabel>
              <FormControl>
                <Input
                  autoComplete="email"
                  className="border-on-dark/20 bg-on-dark text-on-light placeholder:text-on-light/40"
                  placeholder="atelier@vaivae.com"
                  type="email"
                  {...field}
                />
              </FormControl>
              <FormMessage className="border-accent-gold text-on-dark/80" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="consent"
          render={({ field }) => (
            <FormItem className="gap-2">
              <div className="flex items-start gap-3">
                <FormControl>
                  <Checkbox
                    aria-required="true"
                    checked={field.value}
                    className="mt-0.5 border-on-dark/35 bg-transparent text-oxblood data-[state=checked]:border-on-dark data-[state=checked]:bg-on-dark"
                    onCheckedChange={(value) => field.onChange(value === true)}
                  />
                </FormControl>
                <FormLabel className="max-w-md text-sm leading-5 font-normal tracking-normal text-on-dark/72 normal-case">
                  Sign me up for the vaïvae editorial. I can unsubscribe anytime.
                </FormLabel>
              </div>
              <FormDescription className="max-w-md text-xs leading-5 text-on-dark/55">
                We process newsletter consent under our{" "}
                <Link className="text-on-dark underline underline-offset-4" href="/privacy">
                  Privacy Policy
                </Link>
                .
              </FormDescription>
              <FormMessage className="border-accent-gold text-on-dark/80" />
            </FormItem>
          )}
        />

        {result && !result.ok ? (
          <p aria-live="polite" className="text-sm leading-6 text-on-dark/80" role="alert">
            {result.error}
          </p>
        ) : null}

        <Button className="justify-self-start" loading={isPending} tone="on-dark" type="submit">
          {submitLabel?.trim() || "Enter the editorial"}
        </Button>
      </form>
    </Form>
  );
}
