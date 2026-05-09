"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState, useTransition } from "react";
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
  Stack,
} from "@/components/ui";
import { forgotPasswordAction } from "@/medusa/auth-actions";

const forgotPasswordFormSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>;

export function ForgotPasswordForm() {
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const form = useForm<ForgotPasswordFormValues>({
    defaultValues: { email: "" },
    resolver: zodResolver(forgotPasswordFormSchema),
  });

  const onSubmit = (values: ForgotPasswordFormValues) => {
    setError(null);
    startTransition(() => {
      void forgotPasswordAction(values).then((result) => {
        if (!result.ok) {
          setError(result.error);
          return;
        }

        setIsSent(true);
      });
    });
  };

  if (isSent) {
    return (
      <Stack gap={4}>
        <h2 className="font-display text-3xl leading-none font-light tracking-[-0.05em] text-on-light italic">
          Check your inbox
        </h2>
        <p
          className="border-l border-accent-gold pl-3 text-sm leading-6 text-on-light/70"
          role="status"
        >
          If an account exists, a reset email has been sent.
        </p>
        <Button asChild className="w-fit" variant="underline">
          <Link href="/login">Return to sign in</Link>
        </Button>
      </Stack>
    );
  }

  return (
    <Stack gap={6}>
      <div className="grid gap-2">
        <h2 className="font-display text-3xl leading-none font-light tracking-[-0.05em] text-on-light italic">
          Reset access
        </h2>
        <p className="text-sm leading-6 text-on-light/58">
          Enter the email used for your vaïvae account.
        </p>
      </div>

      <Form {...form}>
        <form className="grid gap-5" noValidate onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="email"
                    disabled={isPending}
                    inputMode="email"
                    required
                    type="email"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  For privacy, the response is the same whether an account exists or not.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button className="w-fit" loading={isPending} size="lg" type="submit">
            Send reset email
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

      <Button asChild className="w-fit" variant="underline">
        <Link href="/login">Return to sign in</Link>
      </Button>
    </Stack>
  );
}
