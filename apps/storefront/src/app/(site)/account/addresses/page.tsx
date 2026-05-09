import type { Metadata } from "next";

import { AddressBook } from "@/components/account/address-book";
import { listAddresses } from "@/medusa/customer";

export const metadata: Metadata = {
  title: "Addresses",
};

export default async function AddressesPage() {
  const addresses = await listAddresses();

  return <AddressBook addresses={addresses} />;
}
