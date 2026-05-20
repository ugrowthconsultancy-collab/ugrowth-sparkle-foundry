import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — UGrowth Consultancy" },
      {
        name: "description",
        content:
          "Your data is yours. Request deletion any time at hello@ugrowthconsultancy.com.",
      },
    ],
  }),
  component: () => (
    <section className="flex-1 px-4 py-12 md:py-20">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl md:text-4xl text-primary">Privacy Policy</h1>
        <p className="mt-6 text-base text-foreground leading-relaxed">
          Full policy under preparation. Your data is yours. Request deletion any time at{" "}
          <a className="underline text-primary" href="mailto:hello@ugrowthconsultancy.com">
            hello@ugrowthconsultancy.com
          </a>
          .
        </p>
      </div>
    </section>
  ),
});
