/// <reference types="vitest/globals" />

type RecordConsentInput = {
  customerId: string;
  doubleOptInAt?: Date | null;
  email: string;
  ipAddress?: string | null;
  marketingEmailLists?: string[] | null;
  optOutReason?: string | null;
  source: string;
  subscribed: boolean;
  userAgent?: string | null;
};

type ConsentRecordPayload = {
  consented_at: Date;
  customer_id: string;
  double_opt_in_at: Date | null;
  email: string;
  expires_at: Date | null;
  ip_address: string | null;
  marketing_email_lists: unknown;
  opt_out_reason: string | null;
  source: string;
  subscribed: boolean;
  user_agent: string | null;
};

type ConsentRecordEntity = ConsentRecordPayload & {
  id: string;
};

type MarketingConsentServiceShape = {
  createConsentRecords: (payload: ConsentRecordPayload) => Promise<ConsentRecordEntity>;
  getCurrentConsent: (customerId: string) => Promise<ConsentRecordEntity | null>;
  listConsentRecords: (
    filters: { customer_id: string },
    config: { order: { consented_at: "DESC" }; take: number },
  ) => Promise<ConsentRecordEntity[]>;
  recordConsent: (input: RecordConsentInput) => Promise<ConsentRecordEntity>;
};

type MarketingConsentServiceConstructor = new () => MarketingConsentServiceShape;
type ModuleLoader = (request: string, parent: unknown, isMain: boolean) => unknown;
type ModuleWithLoader = {
  _load: ModuleLoader;
};

function createModelField() {
  const field = {
    index: () => field,
    nullable: () => field,
    primaryKey: () => field,
  };

  return field;
}

function getDefaultExport<T>(module: unknown): T {
  const loaded = module as { default?: T };

  return loaded.default ?? (module as T);
}

async function loadService(): Promise<MarketingConsentServiceShape> {
  vi.resetModules();
  const moduleLoader = require("node:module") as ModuleWithLoader;
  const originalLoad = moduleLoader._load;

  vi.spyOn(moduleLoader, "_load").mockImplementation((request, parent, isMain) => {
    if (request === "@medusajs/framework/utils") {
      return {
        MedusaService: () => class {},
        model: {
          boolean: createModelField,
          dateTime: createModelField,
          define: () => ({ indexes: () => ({}) }),
          id: createModelField,
          json: createModelField,
          text: createModelField,
        },
      };
    }

    if (request === "./models/consent-record.js") {
      return {};
    }

    return originalLoad(request, parent, isMain);
  });

  const module = await import("./service.js");
  const Service = getDefaultExport<MarketingConsentServiceConstructor>(module);

  return new Service();
}

describe("MarketingConsentService", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("returns the latest consent record for a customer", async () => {
    // Arrange
    const service = await loadService();
    const record = {
      consented_at: new Date("2026-05-01T12:00:00.000Z"),
      customer_id: "cus_123",
      double_opt_in_at: null,
      email: "client@example.com",
      expires_at: null,
      id: "concr_123",
      ip_address: null,
      marketing_email_lists: null,
      opt_out_reason: null,
      source: "account",
      subscribed: true,
      user_agent: null,
    } satisfies ConsentRecordEntity;
    const listConsentRecords = vi.fn(async () => [record]);
    service.listConsentRecords = listConsentRecords;

    // Act
    const current = await service.getCurrentConsent(" cus_123 ");

    // Assert
    expect(current).toBe(record);
    expect(listConsentRecords).toHaveBeenCalledWith(
      { customer_id: "cus_123" },
      { order: { consented_at: "DESC" }, take: 1 },
    );
    await expect(service.getCurrentConsent("   ")).resolves.toBeNull();
  });

  it("records normalized opt-out consent", async () => {
    // Arrange
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-09T12:00:00.000Z"));

    const service = await loadService();
    const createConsentRecords = vi.fn(async (payload: ConsentRecordPayload) => ({
      ...payload,
      id: "concr_456",
    }));
    service.createConsentRecords = createConsentRecords;

    // Act
    const record = await service.recordConsent({
      customerId: " cus_456 ",
      email: " CLIENT@EXAMPLE.COM ",
      ipAddress: " 203.0.113.10 ",
      marketingEmailLists: ["newsletter"],
      optOutReason: "  unsubscribe request  ",
      source: " account ",
      subscribed: false,
      userAgent: "   ",
    });

    // Assert
    const firstCall = createConsentRecords.mock.calls.at(0);
    expect(firstCall).toBeDefined();

    if (!firstCall) {
      throw new Error("Expected createConsentRecords to be called.");
    }

    const [payload] = firstCall;
    expect(payload).toMatchObject({
      customer_id: "cus_456",
      email: "client@example.com",
      ip_address: "203.0.113.10",
      marketing_email_lists: ["newsletter"],
      opt_out_reason: "unsubscribe request",
      source: "account",
      subscribed: false,
      user_agent: null,
    });
    expect(payload.consented_at).toEqual(new Date("2026-05-09T12:00:00.000Z"));
    expect(payload.expires_at).toEqual(new Date("2026-06-08T12:00:00.000Z"));
    expect(record.id).toBe("concr_456");
  });
});
