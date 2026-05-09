"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Stack,
} from "@/components/ui";
import { loginAction } from "@/medusa/auth-actions";

const loginFormSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

type LoginFormProps = {
  nextPath: string;
  resetSuccess?: boolean;
};

export function LoginForm({ nextPath, resetSuccess = false }: LoginFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const form = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(loginFormSchema),
  });

  const onSubmit = (values: LoginFormValues) => {
    setError(null);
    startTransition(() => {
      void loginAction(values).then((result) => {
        if (!result.ok) {
          setError(result.error);
          return;
        }

        router.push(nextPath);
        router.refresh();
      });
    });
  };

  return (
    <Stack gap={6}>
      <div className="grid gap-2">
        <h2 className="font-display text-3xl leading-none font-light tracking-[-0.05em] text-on-light italic">
          Sign in
        </h2>
        <p className="text-sm leading-6 text-on-light/58">
          Continue with email and password. Checkout remains available without an account.
        </p>
      </div>

      {resetSuccess ? (
        <p
          className="border-l border-accent-gold pl-3 text-sm leading-6 text-on-light/70"
          role="status"
        >
          Your password has been reset. Sign in with the new password.
        </p>
      ) : null}

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
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="current-password"
                    disabled={isPending}
                    required
                    type="password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button loading={isPending} size="lg" type="submit">
              Sign in
            </Button>
            <Button asChild size="sm" variant="underline">
              <Link href="/login/forgot-password">Forgot password?</Link>
            </Button>
          </div>

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

      <p className="border-t border-on-light/10 pt-5 text-sm leading-6 text-on-light/60">
        Don&apos;t have an account?{" "}
        <Link
          className="text-on-light underline underline-offset-4 hover:text-oxblood"
          href={`/register?next=${encodeURIComponent(nextPath)}`}
        >
          Register
        </Link>
      </p>
    </Stack>
  );
}
