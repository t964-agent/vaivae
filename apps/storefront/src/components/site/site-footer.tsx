import { NewsletterSignupForm } from "@/components/site/newsletter-signup-form";
import { SectionBody, SectionEyebrow } from "@/components/atoms/section-text";
import { cn } from "@/lib/utils";
import type { GlobalQueryResult } from "@/sanity/types";

import { getSiteChrome } from "./site-chrome-data";
import { SiteChromeLink, type ChromeLink } from "./site-link";

type Footer = GlobalQueryResult["footer"];
type SiteSettings = GlobalQueryResult["siteSettings"];
type PaymentMethod = NonNullable<NonNullable<Footer>["paymentMethods"]>[number];

const fallbackLegalLinks = [
  { label: "Privacy", slug: "privacy" },
  { label: "Terms", slug: "terms" },
  { label: "Returns", slug: "returns" },
  { label: "Shipping", slug: "shipping" },
  { label: "Accessibility", slug: "accessibility" },
  { label: "Cookies", slug: "cookies" },
  { label: "Wholesale", slug: "wholesale" },
  { label: "Imprint", slug: "imprint" },
].map(({ label, slug }) => ({
  _key: `fallback-${slug}`,
  _type: "link" as const,
  href: `/${slug}`,
  internalTarget: null,
  label,
  targetBlank: false,
  type: "internal" as const,
})) satisfies ChromeLink[];

function getUsableLinks(links: ChromeLink[] | null | undefined): ChromeLink[] {
  return links?.filter((link) => Boolean(link.label?.trim())) ?? [];
}

function normalizeLabel(label: string | null): string {
  return label?.trim().replaceAll(/\s+/g, " ").toLowerCase() ?? "";
}

const collectionLabels = new Set([
  "collection",
  "collections",
  "lookbook",
  "pre fall 26",
  "summer fall 26",
]);

function getDisplayLabel(label: string | null): string | null {
  const normalized = normalizeLabel(label);

  if (normalized === "drop 1" || normalized === "drop 01") {
    return "READY-TO-WEAR";
  }

  if (collectionLabels.has(normalized)) {
    return "COLLECTIONS";
  }

  return label;
}

function formatPaymentMethod(method: PaymentMethod): string {
  switch (method) {
    case "amex":
      return "Amex";
    case "applepay":
      return "Apple Pay";
    case "googlepay":
      return "Google Pay";
    case "mastercard":
      return "Mastercard";
    case "paypal":
      return "PayPal";
    case "visa":
      return "Visa";
    default:
      return method;
  }
}

function FooterColumns({ footer }: { footer: Footer }) {
  const columns = footer?.columns?.filter((column) => Boolean(column.title?.trim())) ?? [];

  if (columns.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
      {columns.map((column) => {
        const links = getUsableLinks(column.links);

        return (
          <div className="grid content-start gap-4" key={column._key}>
            <h2 className="font-body text-[0.68rem] font-medium tracking-[0.26em] text-on-dark/55 uppercase">
              {column.title}
            </h2>
            {links.length > 0 ? (
              <ul className="grid gap-3">
                {links.map((link) => {
                  return (
                    <li key={link._key ?? `${link.label}-${link.href}`}>
                      <SiteChromeLink
                        className="font-body text-sm leading-5 text-on-dark/72 underline-offset-4 transition-colors hover:text-on-dark hover:underline focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-accent-gold"
                        link={link}
                      >
                        {getDisplayLabel(link.label)}
                      </SiteChromeLink>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function NewsletterBlock({ footer }: { footer: Footer }) {
  if (footer?.newsletterEnabled !== true) {
    return null;
  }

  return (
    <section className="grid gap-8 border-b border-on-dark/10 pb-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(24rem,0.75fr)] lg:items-end">
      <div className="grid gap-4">
        <SectionEyebrow className="text-on-dark/55">
          {footer.newsletterHeading?.trim() || "The editorial"}
        </SectionEyebrow>
        {footer.newsletterDescription ? (
          <SectionBody className="max-w-xl text-on-dark/72">
            {footer.newsletterDescription}
          </SectionBody>
        ) : null}
      </div>
      <NewsletterSignupForm submitLabel={footer.newsletterCtaLabel} />
    </section>
  );
}

function FooterBottom({ footer, siteSettings }: { footer: Footer; siteSettings: SiteSettings }) {
  const year = new Date().getFullYear().toString();
  const legalLinks = getUsableLinks(footer?.legalLinks);
  const resolvedLegalLinks = legalLinks.length > 0 ? legalLinks : fallbackLegalLinks;
  const copyright = (footer?.copyrightText?.trim() || `© ${year} vaïvae`).replaceAll(
    "{year}",
    year,
  );
  const paymentMethods = footer?.paymentMethods ?? [];
  const socialLinks = siteSettings?.socialLinks?.filter((link) => link.url && link.platform) ?? [];

  return (
    <div className="grid gap-8 border-t border-on-dark/10 pt-8 lg:grid-cols-[1fr_auto] lg:items-end">
      <div className="grid gap-5">
        <p className="font-display text-3xl leading-none font-light tracking-[-0.04em] text-on-dark italic">
          {siteSettings?.siteName?.trim() || "vaïvae"}
        </p>
        <p className="max-w-md font-body text-xs leading-5 tracking-[0.08em] text-on-dark/50 uppercase">
          {copyright}
        </p>
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {resolvedLegalLinks.map((link) => {
            return (
              <li key={link._key ?? `${link.label}-${link.href}`}>
                <SiteChromeLink
                  className="font-body text-xs tracking-[0.14em] text-on-dark/58 uppercase underline-offset-4 hover:text-on-dark hover:underline"
                  link={link}
                >
                  {getDisplayLabel(link.label)}
                </SiteChromeLink>
              </li>
            );
          })}
        </ul>
        {socialLinks.length > 0 ? (
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {socialLinks.map((link) => (
              <li key={link._key}>
                <a
                  className="font-body text-xs tracking-[0.14em] text-on-dark/58 uppercase underline-offset-4 hover:text-on-dark hover:underline"
                  href={link.url ?? "#"}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {link.platform}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {paymentMethods.length > 0 ? (
        <div className="flex flex-wrap gap-2 lg:justify-end" aria-label="Accepted payment methods">
          {paymentMethods.map((method) => (
            <span
              className="border border-on-dark/15 px-2.5 py-1 font-body text-[0.62rem] tracking-[0.14em] text-on-dark/58 uppercase"
              key={method}
            >
              {formatPaymentMethod(method)}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export async function SiteFooter() {
  const data = await getSiteChrome();
  const footer = data.footer;

  return (
    <footer
      className={cn("bg-oxblood px-6 py-16 text-on-dark md:px-8 lg:px-12")}
      role="contentinfo"
    >
      <div className="mx-auto grid max-w-7xl gap-14">
        <NewsletterBlock footer={footer} />
        <FooterColumns footer={footer} />
        <FooterBottom footer={footer} siteSettings={data.siteSettings} />
      </div>
    </footer>
  );
}
