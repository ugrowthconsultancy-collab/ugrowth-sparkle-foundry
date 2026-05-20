import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — UGrowth Consultancy" }] }),
  component: () => (
    <section className="flex-1 flex items-center justify-center px-4 py-20">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl text-primary">Settings</h1>
        <p className="mt-3 text-sm text-muted-foreground">Coming soon.</p>
      </div>
    </section>
  ),
});
