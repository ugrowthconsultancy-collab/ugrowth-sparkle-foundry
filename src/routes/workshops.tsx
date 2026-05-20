import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/StubPage";

export const Route = createFileRoute("/workshops")({
  head: () => ({
    meta: [
      { title: "Workshops — Pricing Mastery & More | UGrowth Consultancy" },
      {
        name: "description",
        content:
          "Live workshops with Captain Ankur Kulshrestha. Pricing, positioning, first-client outreach.",
      },
    ],
  }),
  component: () => (
    <StubPage kicker="Workshops" title="Captain's Pricing Mastery Workshop" />
  ),
});
