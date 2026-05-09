"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  AddressForm,
  emptyAddressFormValues,
  type AddressFormValues,
} from "@/components/account/address-form";
import {
  Badge,
  Button,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  HStack,
  Stack,
} from "@/components/ui";
import { toast } from "@/lib/toast";
import {
  addAddressAction,
  deleteAddressAction,
  updateAddressAction,
} from "@/medusa/account-actions";
import type { StoreCustomerAddress } from "@/medusa/types";

type AddressBookProps = {
  addresses: StoreCustomerAddress[];
};

type EditingState =
  | { address: StoreCustomerAddress; mode: "edit" }
  | { address: null; mode: "create" }
  | null;

function normalizeState(value: string | null | undefined): string {
  return value?.trim().toUpperCase() ?? "";
}

function addressToFormValues(address: StoreCustomerAddress): AddressFormValues {
  return {
    address1: address.address_1 ?? "",
    address2: address.address_2 ?? "",
    city: address.city ?? "",
    country: "US",
    firstName: address.first_name ?? "",
    isDefaultBilling: address.is_default_billing === true,
    isDefaultShipping: address.is_default_shipping === true,
    lastName: address.last_name ?? "",
    phone: address.phone ?? "",
    postalCode: address.postal_code ?? "",
    state: normalizeState(address.province),
  };
}

function formatAddressLine(address: StoreCustomerAddress): string {
  return [address.city, normalizeState(address.province), address.postal_code]
    .filter(Boolean)
    .join(", ");
}

export function AddressBook({ addresses }: AddressBookProps) {
  const router = useRouter();
  const [editing, setEditing] = useState<EditingState>(null);
  const [isDeleting, startDeleteTransition] = useTransition();
  const isOpen = editing !== null;

  function closeDrawer(): void {
    setEditing(null);
  }

  async function handleSubmit(values: AddressFormValues): Promise<void> {
    const result =
      editing?.mode === "edit" && editing.address
        ? await updateAddressAction(editing.address.id, values)
        : await addAddressAction(values);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    toast.success(editing?.mode === "edit" ? "Address updated" : "Address added");
    closeDrawer();
    router.refresh();
  }

  function handleDelete(address: StoreCustomerAddress): void {
    startDeleteTransition(() => {
      void deleteAddressAction(address.id).then((result) => {
        if (!result.ok) {
          toast.error(result.error);
          return;
        }

        toast.success("Address removed");
        router.refresh();
      });
    });
  }

  return (
    <>
      <Stack gap={6}>
        <HStack align="start" justify="between" wrap>
          <div className="grid gap-2">
            <h2 className="font-display text-4xl leading-none font-light tracking-[-0.05em] text-on-light italic">
              Saved addresses
            </h2>
            <p className="text-sm leading-6 text-on-light/60">
              Keep shipping and billing details ready for a quieter checkout.
            </p>
          </div>
          <Button onClick={() => setEditing({ address: null, mode: "create" })} type="button">
            <Plus aria-hidden className="size-4" />
            Add new address
          </Button>
        </HStack>

        {addresses.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2" role="list">
            {addresses.map((address) => (
              <article
                className="grid gap-5 border border-on-light/10 bg-on-light/[0.025] p-5"
                key={address.id}
                role="listitem"
              >
                <Stack gap={3}>
                  <HStack gap={2} wrap>
                    {address.is_default_shipping ? <Badge size="sm">Default shipping</Badge> : null}
                    {address.is_default_billing ? <Badge size="sm">Default billing</Badge> : null}
                  </HStack>
                  <div className="text-sm leading-6 text-on-light/70">
                    <p className="font-medium text-on-light">
                      {[address.first_name, address.last_name].filter(Boolean).join(" ")}
                    </p>
                    <p>{address.address_1}</p>
                    {address.address_2 ? <p>{address.address_2}</p> : null}
                    <p>{formatAddressLine(address)}</p>
                    <p>United States</p>
                    {address.phone ? <p>{address.phone}</p> : null}
                  </div>
                </Stack>

                <HStack gap={3} wrap>
                  <Button
                    onClick={() => setEditing({ address, mode: "edit" })}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    Edit
                  </Button>
                  <Button
                    disabled={isDeleting}
                    onClick={() => handleDelete(address)}
                    size="sm"
                    type="button"
                    variant="underline"
                  >
                    Delete
                  </Button>
                </HStack>
              </article>
            ))}
          </div>
        ) : (
          <div className="grid min-h-64 place-items-center border border-on-light/10 bg-on-light/[0.025] p-8 text-center">
            <Stack align="center" className="max-w-md" gap={4}>
              <h3 className="font-display text-3xl leading-none font-light tracking-[-0.05em] text-on-light italic">
                No saved addresses yet.
              </h3>
              <p className="text-sm leading-6 text-on-light/60">
                Add one now, or let checkout save the first address you use.
              </p>
              <Button onClick={() => setEditing({ address: null, mode: "create" })} type="button">
                Add address
              </Button>
            </Stack>
          </div>
        )}
      </Stack>

      <Drawer open={isOpen} onOpenChange={(nextOpen) => (nextOpen ? undefined : closeDrawer())}>
        <DrawerContent aria-describedby="address-drawer-description" side="right">
          <DrawerHeader>
            <DrawerTitle>{editing?.mode === "edit" ? "Edit address" : "Add address"}</DrawerTitle>
            <DrawerDescription id="address-drawer-description">
              Saved addresses are held by Medusa and used only for account and checkout flows.
            </DrawerDescription>
          </DrawerHeader>
          <div className="mt-8">
            <AddressForm
              buttonLabel={editing?.mode === "edit" ? "Save address" : "Add address"}
              defaultValues={
                editing?.mode === "edit" && editing.address
                  ? addressToFormValues(editing.address)
                  : emptyAddressFormValues
              }
              onSubmit={handleSubmit}
            />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
