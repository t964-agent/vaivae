"use client";

import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import {
  createContext,
  forwardRef,
  useContext,
  useId,
  type ComponentPropsWithoutRef,
  type ComponentRef,
  type HTMLAttributes,
} from "react";
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldError,
  type FieldPath,
  type FieldValues,
  type FormProviderProps,
} from "react-hook-form";

import { cn } from "@/lib/utils";

type FormFieldContextValue = {
  name: string;
};

type FormItemContextValue = {
  id: string;
};

export type UseFormFieldReturn = {
  id: string;
  name: string;
  formItemId: string;
  formDescriptionId: string;
  formMessageId: string;
  error: FieldError | undefined;
  errorMessage: string | undefined;
};

const FormFieldContext = createContext<FormFieldContextValue | null>(null);
const FormItemContext = createContext<FormItemContextValue | null>(null);

/**
 * React Hook Form provider.
 *
 * @example
 * ```tsx
 * const form = useForm({ defaultValues: { email: "" } });
 *
 * <Form {...form}>
 *   <form onSubmit={form.handleSubmit(onSubmit)}>
 *     <FormField
 *       control={form.control}
 *       name="email"
 *       render={({ field }) => (
 *         <FormItem>
 *           <FormLabel>Email</FormLabel>
 *           <FormControl>
 *             <Input {...field} />
 *           </FormControl>
 *           <FormMessage />
 *         </FormItem>
 *       )}
 *     />
 *   </form>
 * </Form>
 * ```
 */
function Form<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
  TTransformedValues = TFieldValues,
>(props: FormProviderProps<TFieldValues, TContext, TTransformedValues>) {
  return <FormProvider {...props} />;
}
Form.displayName = "Form";

/** Controller wrapper that provides field metadata to Form subcomponents. */
function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>(props: ControllerProps<TFieldValues, TName, TTransformedValues>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}
FormField.displayName = "FormField";

/** Reads the current field id, error, and aria target ids. */
function useFormField(): UseFormFieldReturn {
  const fieldContext = useContext(FormFieldContext);
  const itemContext = useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ exact: true, name: fieldContext?.name ?? "" });

  if (!fieldContext) {
    throw new Error("useFormField must be used within <FormField>.");
  }

  if (!itemContext) {
    throw new Error("useFormField must be used within <FormItem>.");
  }

  const fieldState = getFieldState(fieldContext.name, formState);
  const errorMessage =
    typeof fieldState.error?.message === "string" ? fieldState.error.message : undefined;

  return {
    error: fieldState.error,
    errorMessage,
    formDescriptionId: `${itemContext.id}-form-item-description`,
    formItemId: `${itemContext.id}-form-item`,
    formMessageId: `${itemContext.id}-form-item-message`,
    id: itemContext.id,
    name: fieldContext.name,
  };
}

export type FormItemProps = HTMLAttributes<HTMLDivElement>;

/** Field layout wrapper that owns a generated id for labels and messages. */
const FormItem = forwardRef<HTMLDivElement, FormItemProps>(function FormItem(
  { className, ...props },
  ref,
) {
  const id = useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn("grid gap-2", className)} {...props} />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = "FormItem";

export type FormLabelProps = ComponentPropsWithoutRef<typeof LabelPrimitive.Root>;

/** Label bound to the current FormControl id. */
const FormLabel = forwardRef<ComponentRef<typeof LabelPrimitive.Root>, FormLabelProps>(
  function FormLabel({ className, htmlFor, ...props }, ref) {
    const { error, formItemId } = useFormField();

    return (
      <LabelPrimitive.Root
        ref={ref}
        className={cn(
          "font-body text-xs font-medium tracking-[0.12em] text-on-light uppercase data-[invalid=true]:underline data-[invalid=true]:decoration-accent-red data-[invalid=true]:decoration-2 data-[invalid=true]:underline-offset-4",
          className,
        )}
        data-invalid={error ? "true" : undefined}
        htmlFor={htmlFor ?? formItemId}
        {...props}
      />
    );
  },
);
FormLabel.displayName = "FormLabel";

export type FormControlProps = ComponentPropsWithoutRef<typeof Slot>;

/** Slot that injects id and aria-invalid/aria-describedby into the actual control. */
const FormControl = forwardRef<HTMLElement, FormControlProps>(function FormControl(
  { ...props },
  ref,
) {
  const { error, formDescriptionId, formItemId, formMessageId } = useFormField();

  return (
    <Slot
      ref={ref}
      aria-describedby={error ? `${formDescriptionId} ${formMessageId}` : formDescriptionId}
      aria-invalid={error ? true : undefined}
      data-invalid={error ? "true" : undefined}
      id={formItemId}
      {...props}
    />
  );
});
FormControl.displayName = "FormControl";

export type FormDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

/** Helper text associated with the current field. */
const FormDescription = forwardRef<HTMLParagraphElement, FormDescriptionProps>(
  function FormDescription({ className, ...props }, ref) {
    const { formDescriptionId } = useFormField();

    return (
      <p
        ref={ref}
        className={cn("text-sm leading-5 text-on-light/55", className)}
        id={formDescriptionId}
        {...props}
      />
    );
  },
);
FormDescription.displayName = "FormDescription";

export type FormMessageProps = HTMLAttributes<HTMLParagraphElement>;

/** Error message renderer for the current field. */
const FormMessage = forwardRef<HTMLParagraphElement, FormMessageProps>(function FormMessage(
  { children, className, ...props },
  ref,
) {
  const { errorMessage, formMessageId } = useFormField();
  const body = errorMessage ?? children;

  if (!body) {
    return null;
  }

  return (
    <p
      ref={ref}
      aria-live="polite"
      className={cn("border-l border-accent-red pl-3 text-sm leading-5 text-on-light", className)}
      id={formMessageId}
      role="alert"
      {...props}
    >
      {body}
    </p>
  );
});
FormMessage.displayName = "FormMessage";

export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
};
