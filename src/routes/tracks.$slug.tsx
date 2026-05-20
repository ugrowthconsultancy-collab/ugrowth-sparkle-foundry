import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/StubPage";

const TITLES: Record<string, string> = {
  "stuck-professional": "The Stuck Professional",
  "side-hustler": "The Side Hustler",
  "returning-to-work": "Returning to Work",
  "rising-graduate": "The Rising Graduate",
  "first-gen-consultant": "The First-Gen Consultant",
  "tier2-dreamer": "The Tier-2 Dreamer",
};

export const Route = createFileRoute("/tracks/$slug")({
  component: () => {
    const { slug } = Route.useParams();
    return <StubPage kicker="Track" title={TITLES[slug] ?? slug} />;
  },
});
