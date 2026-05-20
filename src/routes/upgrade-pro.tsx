import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/StubPage";

export const Route = createFileRoute("/upgrade-pro")({
  head: () => ({
    meta: [
      { title: "AI Pro — Unlimited AI Advisor | UGrowth Consultancy" },
      {
        name: "description",
        content:
          "Upgrade to AI Pro for unlimited messages with the UGrowth AI Advisor. ₹199/month.",
      },
    ],
  }),
  component: () => (
    <StubPage
      kicker="AI Pro"
      title="Unlimited AI Advisor — ₹199/month"
    />
  ),
});
