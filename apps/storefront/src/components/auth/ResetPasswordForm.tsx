"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
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
import { isPasswordBreached } from "@/lib/auth/hibp";
import { passwordRequirementText, passwordSchema } from "@/lib/auth/password";
import { resetPasswordAction } from "@/medusa/auth-actions";

const resetPasswordFormSchema = z
  .object({
    confirmPassword: z.string().min(1, "Confirm your new password."),
    email: z.string().trim().toLowerCase().email("Enter the email for this account."),
    newPassword: passwordSchema,
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords must match.",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;

type ResetPasswordFormProps = {
  email?: string | undefined;
  token: string;
};

export function ResetPasswordForm({ email, token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isCheckingPassword, setIsCheckingPassword] = useState(false);
  const form = useForm<ResetPasswordFormValues>({
    defaultValues: {
      confirmPassword: "",
      email: email ?? "",
      newPassword: "",
    },
    resolver: zodResolver(resetPasswordFormSchema),
  });
  const isSubmitting = isPending || isCheckingPassword;

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setError(null);
    setIsCheckingPassword(true);

    try {
      const breached = await isPasswordBreached(values.newPassword);

      if (breached) {
        form.setError("newPassword", {
          message: "Choose a password that has not appeared in known breaches.",
          type: "validate",
        });
        return;
      }
    } catch {
      form.setError("newPassword", {
        message: "We could not verify this password. Try again in a moment.",
        type: "validate",
      });
      return;
    } finally {
      setIsCheckingPassword(false);
    }

    startTransition(() => {
      void resetPasswordAction({
        email: values.email,
        newPassword: values.newPassword,
        token,
      }).then((result) => {
        if (!result.ok) {
          setError(result.error);
          return;
        }

        router.push("/login?reset=success");
        router.refresh();
      });
    });
  };

  return (
    <Stack gap={6}>
      <div className="grid gap-2">
        <h2 className="font-display text-3xl leading-none font-light tracking-[-0.05em] text-on-light italic">
          New password
        </h2>
        <p className="text-sm leading-6 text-on-light/58">
          Choose a new password for the account tied to this reset link.
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
                    disabled={isSubmitting}
                    inputMode="email"
                    required
                    type="email"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Medusa requires the account email to confirm the reset token.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New password</FormLabel>
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

          <Button loading={isSubmitting} size="lg" type="submit">
            Reset password
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
