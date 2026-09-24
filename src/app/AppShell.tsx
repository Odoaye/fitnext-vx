"use client";

import dynamic from "next/dynamic";

const XcelLearnApp = dynamic(() => import("../App"), {
  ssr: false,
  loading: () => (
    <main className="grid min-h-screen place-items-center bg-background text-foreground">
      <p className="text-sm text-muted-foreground">Loading XcelLearn…</p>
    </main>
  ),
});

export default function AppShell() {
  return <XcelLearnApp />;
}