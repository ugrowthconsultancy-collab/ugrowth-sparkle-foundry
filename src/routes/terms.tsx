import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use — UGrowth Consultancy" },
      { name: "description", content: "Terms of Use — under preparation." },
    ],
  }),
  component: () => (
    <section className="flex-1 px-4 py-12 md:py-20">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl md:text-4xl text-primary">Terms of Use</h1>
        <p className="mt-6 text-base text-foreground leading-relaxed">
          Full terms under preparation. Use of UGrowth Consultancy is governed by our
          forthcoming Terms of Use. Questions? Email{" "}
          <a className="underline text-primary" href="mailto:hello@ugrowthconsultancy.com">
            hello@ugrowthconsultancy.com
          </a>
          .
        </p>
      </div>
    </section>
  ),
});
