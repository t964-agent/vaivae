import { defineLive } from "next-sanity/live";

import { client } from "./client";

const readToken = process.env["SANITY_API_READ_TOKEN"];

export const { sanityFetch, SanityLive } = defineLive({
  client,
  ...(readToken ? { browserToken: readToken, serverToken: readToken } : {}),
});
