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
import { toast } from "@/lib/toast";
import { updatePasswordAction, updateProfileAction } from "@/medusa/auth-actions";

const optionalPhoneSchema = z
  .string()
  .trim()
  .refine((value) => value === "" || /^[+()\-\d\s.]{7,32}$/.test(value), {
    message: "Enter a valid phone number.",
  });

const profileFormSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  firstName: z.string().trim().min(1, "Enter your first name."),
  lastName: z.string().trim().min(1, "Enter your last name."),
  phone: optionalPhoneSchema,
});

const passwordFormSchema = z
  .object({
    confirmPassword: z.string().min(1, "Confirm your new password."),
    newPassword: passwordSchema,
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords must match.",
    path: ["confirmPassword"],
  });

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

type ProfileFormsProps = {
  customer: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
};

export function ProfileForm({ customer }: ProfileFormsProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const form = useForm<ProfileFormValues>({
    defaultValues: customer,
    resolver: zodResolver(profileFormSchema),
  });

  function onSubmit(values: ProfileFormValues): void {
    setError(null);
    startTransition(() => {
      void updateProfileAction({
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
      }).then((result) => {
        if (!result.ok) {
          setError(result.error);
          return;
        }

        toast.success("Profile updated");
        router.refresh();
      });
    });
  }

  return (
    <Stack gap={6}>
      <div className="grid gap-2">
        <h2 className="font-display text-4xl leading-none font-light tracking-[-0.05em] text-on-light italic">
          Profile
        </h2>
        <p className="text-sm leading-6 text-on-light/60">
          Update the name and phone number used across account and checkout.
        </p>
      </div>

      <Form {...form}>
        <form className="grid gap-5" noValidate onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input autoComplete="given-name" disabled={isPending} required {...field} />
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
                    <Input autoComplete="family-name" disabled={isPending} required {...field} />
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
                  <Input autoComplete="email" disabled inputMode="email" type="email" {...field} />
                </FormControl>
                <FormDescription>
                  Email changes are deferred until verification is wired for Phase 1 operations.
                </FormDescription>
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
                    disabled={isPending}
                    inputMode="tel"
                    type="tel"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button className="w-fit" loading={isPending} size="lg" type="submit">
            Save profile
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

export function PasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isCheckingPassword, setIsCheckingPassword] = useState(false);
  const form = useForm<PasswordFormValues>({
    defaultValues: {
      confirmPassword: "",
      newPassword: "",
    },
    resolver: zodResolver(passwordFormSchema),
  });
  const isSubmitting = isPending || isCheckingPassword;

  async function onSubmit(values: PasswordFormValues): Promise<void> {
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
      void updatePasswordAction({ newPassword: values.newPassword }).then((result) => {
        if (!result.ok) {
          setError(result.error);
          return;
        }

        form.reset({ confirmPassword: "", newPassword: "" });
        toast.success("Password updated");
      });
    });
  }

  return (
    <Stack gap={6}>
      <div className="grid gap-2">
        <h2 className="font-display text-4xl leading-none font-light tracking-[-0.05em] text-on-light italic">
          Password
        </h2>
        <p className="text-sm leading-6 text-on-light/60">
          Choose a new password for this account.
        </p>
      </div>

      <Form {...form}>
        <form className="grid gap-5" noValidate onSubmit={form.handleSubmit(onSubmit)}>
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

          <Button className="w-fit" loading={isSubmitting} size="lg" type="submit">
            Update password
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
