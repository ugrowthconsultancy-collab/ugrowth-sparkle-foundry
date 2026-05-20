import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "UGrowth Consultancy — Start your own practice in India" },
      {
        name: "description",
        content:
          "Free help to start your own consulting or services practice. Real methodology, real tools, real outcomes.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <section className="flex-1 flex items-center justify-center px-4 py-24 lg:py-32">
      <div className="max-w-2xl text-center">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
          UGrowth Consultancy
        </p>
        <h1 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-semibold text-primary leading-[1.15]">
          Coming soon
        </h1>
        <p className="mt-6 text-base md:text-lg text-muted-foreground leading-relaxed">
          We are building India's most honest platform to help professionals start
          their own practice. Free help. Real methodology. No catch.
        </p>
      </div>
    </section>
  );
}
