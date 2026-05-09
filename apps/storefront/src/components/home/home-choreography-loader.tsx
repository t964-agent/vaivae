"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { HomeServerFallback, type HomeContent } from "./home-server-fallback";

const DynamicHomeChoreography = dynamic(
  () => import("./home-choreography").then((module) => module.HomeChoreography),
  { loading: () => null, ssr: false },
);

export function HomeChoreographyLoader({ content }: { content: HomeContent }) {
  const [ready, setReady] = useState(false);

  return (
    <>
      <DynamicHomeChoreography content={content} onReady={() => setReady(true)} />
      {!ready ? <HomeServerFallback content={content} /> : null}
    </>
  );
}
