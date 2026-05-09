import { defineQuery } from "next-sanity";

export const siteSettingsQuery = defineQuery(`*[_type == "siteSettings"][0]`);
