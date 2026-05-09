import type { EventsApi as EventsApiType, ProfilesApi as ProfilesApiType } from "klaviyo-api";
import type * as KlaviyoApiModule from "klaviyo-api";

const { Auth, EventsApi, ProfilesApi } = require("klaviyo-api") as typeof KlaviyoApiModule;

type KlaviyoClient = {
  events: EventsApiType;
  profiles: ProfilesApiType;
};

function createKlaviyoClient(privateKey: string): KlaviyoClient {
  const normalizedKey = privateKey.trim();

  if (!normalizedKey) {
    throw new Error("KLAVIYO_PRIVATE_KEY is required to initialize Klaviyo.");
  }

  const session = new Auth.ApiKeySession(normalizedKey);

  return {
    events: new EventsApi(session),
    profiles: new ProfilesApi(session),
  };
}

module.exports = {
  createKlaviyoClient,
};
