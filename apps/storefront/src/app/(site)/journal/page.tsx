import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";

import { SectionBody, SectionEyebrow, SectionHeading } from "@/components/atoms/section-text";
import { JournalCard } from "@/components/cards/journal-card";
import { Button, Container, HStack, Stack } from "@/components/ui";
import { journalListQuery } from "@/sanity/queries";
import { sanityFetch } from "@/sanity/live";
import type { JournalListQueryResult } from "@/sanity/types";

const JOURNAL_PAGE_SIZE = 9;

type JournalPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getPageNumber(searchParams: Record<string, string | string[] | undefined>): number {
  const rawPage = searchParams["page"];
  const value = Array.isArray(rawPage) ? rawPage[0] : rawPage;
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 1 ? parsed : 1;
}

function getJournalPageHref(page: number): Route {
  return (page <= 1 ? "/journal" : `/journal?page=${page}`) as Route;
}

async function getJournalEntries(): Promise<JournalListQueryResult> {
  try {
    const { data } = await sanityFetch({ query: journalListQuery, tags: ["journal"] });

    return data;
  } catch {
    return [];
  }
}

export async function generateMetadata({ searchParams }: JournalPageProps): Promise<Metadata> {
  const page = getPageNumber(await searchParams);
  const description =
    "Field notes from vaïvae: essays, capsule studies, and quiet records from the studio.";

  return {
    alternates: {
      canonical: getJournalPageHref(page),
    },
    description,
    openGraph: {
      description,
      title: "Editorial Journal — vaïvae",
      type: "website",
      url: getJournalPageHref(page),
    },
    title: page > 1 ? `Editorial Journal, page ${page}` : "Editorial Journal",
  };
}

export default async function JournalPage({ searchParams }: JournalPageProps) {
  const page = getPageNumber(await searchParams);
  const entries = await getJournalEntries();
  const pageCount = Math.max(1, Math.ceil(entries.length / JOURNAL_PAGE_SIZE));
  const boundedPage = Math.min(page, pageCount);
  const start = (boundedPage - 1) * JOURNAL_PAGE_SIZE;
  const paginatedEntries = entries.slice(start, start + JOURNAL_PAGE_SIZE);

  return (
    <Container asChild variant="wide">
      <section aria-labelledby="journal-heading" className="pt-28 pb-20 md:pt-36 md:pb-28">
        <Stack gap={12}>
          <Stack className="max-w-4xl" gap={6}>
            <SectionEyebrow>Field Notes</SectionEyebrow>
            <SectionHeading as="h1" id="journal-heading">
              Editorial Journal
            </SectionHeading>
            <SectionBody>
              Essays, studio notes, and capsule records. Written with the same restraint as the
              garments themselves.
            </SectionBody>
          </Stack>

          {paginatedEntries.length > 0 ? (
            <Stack gap={10}>
              <div className="grid gap-x-6 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
                {paginatedEntries.map((entry) => (
                  <JournalCard entry={entry} key={entry._id} />
                ))}
              </div>

              {pageCount > 1 ? (
                <HStack justify="between">
                  <Button asChild disabled={boundedPage <= 1} variant="underline">
                    <Link href={getJournalPageHref(Math.max(1, boundedPage - 1))}>Previous</Link>
                  </Button>
                  <span className="font-body text-xs tracking-[0.16em] text-on-light/45 uppercase">
                    Page {boundedPage} of {pageCount}
                  </span>
                  <Button asChild disabled={boundedPage >= pageCount} variant="underline">
                    <Link href={getJournalPageHref(Math.min(pageCount, boundedPage + 1))}>Next</Link>
                  </Button>
                </HStack>
              ) : null}
            </Stack>
          ) : (
            <p className="max-w-xl border-y border-on-light/10 py-10 font-display text-3xl leading-tight font-light tracking-[-0.04em] text-on-light/65 italic">
              Field notes are forthcoming.
            </p>
          )}
        </Stack>
      </section>
    </Container>
  );
}
