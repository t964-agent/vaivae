import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import type { SanityImage } from "@/sanity/types";

import { VaivaeImage } from "./vaivae-image";

type LinkMarkValue = {
  href?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getLinkHref(value: unknown): string | null {
  if (!isRecord(value)) {
    return null;
  }

  const href = (value as LinkMarkValue).href;

  return typeof href === "string" && href.trim().length > 0 ? href.trim() : null;
}

function isExternalHref(href: string): boolean {
  return /^(https?:|mailto:|tel:)/i.test(href);
}

function isSanityImage(value: unknown): value is SanityImage {
  return isRecord(value) && value["_type"] === "vaivaeImage";
}

function InlineLink({ children, href }: { children: ReactNode; href: string }) {
  const className =
    "underline decoration-accent-red/40 decoration-1 underline-offset-4 transition-colors hover:decoration-accent-red focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-accent-gold";

  if (isExternalHref(href)) {
    return (
      <a className={className} href={href} rel="noopener noreferrer" target="_blank">
        {children}
      </a>
    );
  }

  return (
    <Link className={className} href={href as Route}>
      {children}
    </Link>
  );
}

const defaultComponents = {
  block: {
    blockquote: ({ children }) => (
      <blockquote className="my-8 border-l-2 border-accent-red pl-4 font-display text-2xl leading-snug font-light tracking-[-0.025em] text-on-light italic">
        {children}
      </blockquote>
    ),
    h2: ({ children }) => (
      <h2 className="mt-12 mb-5 font-display text-3xl leading-tight font-light tracking-[-0.04em] text-on-light italic md:text-5xl">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-10 mb-4 font-display text-2xl leading-tight font-light tracking-[-0.035em] text-on-light md:text-4xl">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="mt-8 mb-3 font-body text-sm font-medium tracking-[0.16em] text-on-light uppercase">
        {children}
      </h4>
    ),
    normal: ({ children }) => (
      <p className="font-body text-base leading-relaxed text-on-light/75 md:text-lg">{children}</p>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="my-6 grid list-disc gap-2 pl-5 font-body text-base leading-relaxed text-on-light/75 marker:text-accent-red">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="my-6 grid list-decimal gap-2 pl-5 font-body text-base leading-relaxed text-on-light/75 marker:text-accent-red">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="pl-2">{children}</li>,
    number: ({ children }) => <li className="pl-2">{children}</li>,
  },
  marks: {
    em: ({ children }) => <em className="font-display font-light italic">{children}</em>,
    link: ({ children, value }) => {
      const href = getLinkHref(value);

      return href ? <InlineLink href={href}>{children}</InlineLink> : <>{children}</>;
    },
    strong: ({ children }) => <strong className="font-medium text-on-light">{children}</strong>,
  },
  types: {
    vaivaeImage: ({ isInline, value }) => {
      if (!isSanityImage(value)) {
        return null;
      }

      return (
        <figure className={cn(isInline ? "mx-1 inline-block align-middle" : "my-10")}>
          <VaivaeImage
            className={cn(isInline ? "max-h-28 w-auto" : "w-full")}
            image={value}
            sizes={isInline ? "160px" : "(min-width: 1024px) 760px, 100vw"}
            {...(isInline ? { width: 160 } : {})}
          />
          {!isInline && value.caption ? (
            <figcaption className="mt-3 font-body text-xs tracking-[0.08em] text-on-light/50 uppercase">
              {value.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    },
  },
} satisfies PortableTextComponents;

export type RichTextProps = {
  className?: string;
  components?: PortableTextComponents;
  value: PortableTextBlock[] | undefined;
};

export function RichText({ className, components, value }: RichTextProps) {
  if (!value?.length) {
    return null;
  }

  return (
    <div
      className={cn(
        "prose max-w-none space-y-5 text-on-light prose-p:my-0 prose-a:text-on-light prose-strong:text-on-light prose-em:text-inherit",
        className,
      )}
    >
      <PortableText
        components={components ? { ...defaultComponents, ...components } : defaultComponents}
        value={value}
      />
    </div>
  );
}
