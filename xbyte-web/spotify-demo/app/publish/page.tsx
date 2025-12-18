"use client";

import { useMemo } from "react";
import { xByteClient } from "xbyte-sdk";
import PublishForm from "@/components/publish/form";

export default function PublishPage() {
  const client = useMemo(() => new xByteClient(), []);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <main className="flex w-full flex-col items-center gap-8 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Publisher Panel</h1>
          <p className="mt-2 text-muted-foreground">
            Upload your content and set prices for your audience
          </p>
        </div>
        <PublishForm client={client} />
      </main>
    </div>
  );
}
