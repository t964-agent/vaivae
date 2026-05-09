"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Stack,
} from "@/components/ui";
import { isPasswordBreached } from "@/lib/auth/hibp";
import { passwordRequirementText, passwordSchema } from "@/lib/auth/password";
import { subscribeNewsletterAction } from "@/lib/marketing/actions";
import { registerAction } from "@/medusa/auth-actions";

const registerFormSchema = z
  .object({
    confirmPassword: z.string().min(1, "Confirm your password."),
    email: z.string().trim().toLowerCase().email("Enter a valid email address."),
    firstName: z.string().trim().min(1, "Enter your first name."),
    lastName: z.string().trim().min(1, "Enter your last name."),
    marketingConsent: z.boolean(),
    password: passwordSchema,
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords must match.",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerFormSchema>;

type RegisterFormProps = {
  nextPath: string;
};

export function RegisterForm({ nextPath }: RegisterFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isCheckingPassword, setIsCheckingPassword] = useState(false);
  const form = useForm<RegisterFormValues>({
    defaultValues: {
      confirmPassword: "",
      email: "",
      firstName: "",
      lastName: "",
      marketingConsent: false,
      password: "",
    },
    resolver: zodResolver(registerFormSchema),
  });
  const isSubmitting = isPending || isCheckingPassword;

  const onSubmit = async (values: RegisterFormValues) => {
    setError(null);
    setIsCheckingPassword(true);

    try {
      const breached = await isPasswordBreached(values.password);

      if (breached) {
        form.setError("password", {
          message: "Choose a password that has not appeared in known breaches.",
          type: "validate",
        });
        return;
      }
    } catch {
      form.setError("password", {
        message: "We could not verify this password. Try again in a moment.",
        type: "validate",
      });
      return;
    } finally {
      setIsCheckingPassword(false);
    }

    startTransition(() => {
      void registerAction({
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        password: values.password,
      }).then((result) => {
        if (!result.ok) {
          setError(result.error);
          return;
        }

        if (values.marketingConsent) {
          void subscribeNewsletterAction({ consent: true, email: values.email });
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
          Create account
        </h2>
        <p className="text-sm leading-6 text-on-light/58">
          Save addresses, return to order history, and build a wishlist when the account area opens.
        </p>
      </div>

      <Form {...form}>
        <form className="grid gap-5" noValidate onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input autoComplete="given-name" disabled={isSubmitting} required {...field} />
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
                    <Input autoComplete="family-name" disabled={isSubmitting} required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="email"
                    disabled={isSubmitting}
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
                    autoComplete="new-password"
                    disabled={isSubmitting}
                    required
                    type="password"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  {passwordRequirementText} We also check Have I Been Pwned before submission.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="new-password"
                    disabled={isSubmitting}
                    required
                    type="password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="marketingConsent"
            render={({ field }) => (
              <FormItem className="gap-2">
                <div className="flex items-start gap-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      disabled={isSubmitting}
                      onCheckedChange={(value) => field.onChange(value === true)}
                    />
                  </FormControl>
                  <FormLabel className="text-sm leading-5 font-normal tracking-normal text-on-light/68 normal-case">
                    Send me the vaïvae editorial. I can unsubscribe anytime.
                  </FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <p className="text-xs leading-5 text-on-light/50">
            By creating an account, you agree to our{" "}
            <Link
              className="text-on-light underline underline-offset-4 hover:text-oxblood"
              href="/terms"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              className="text-on-light underline underline-offset-4 hover:text-oxblood"
              href="/privacy"
            >
              Privacy Policy
            </Link>
            .
          </p>

          <Button loading={isSubmitting} size="lg" type="submit">
            Create account
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

      <p className="border-t border-on-light/10 pt-5 text-sm leading-6 text-on-light/60">
        Already have an account?{" "}
        <Link
          className="text-on-light underline underline-offset-4 hover:text-oxblood"
          href={`/login?next=${encodeURIComponent(nextPath)}`}
        >
          Sign in
        </Link>
      </p>
    </Stack>
  );
}
