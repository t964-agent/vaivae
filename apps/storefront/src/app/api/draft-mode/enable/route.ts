import { defineEnableDraftMode } from "next-sanity/draft-mode";

import { client } from "@/sanity/client";

const readToken = process.env["SANITY_API_READ_TOKEN"];

export const { GET } = defineEnableDraftMode({
  client: readToken ? client.withConfig({ token: readToken }) : client,
});
