import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/StubPage";

export const Route = createFileRoute("/circles")({
  component: () => <StubPage kicker="Founder Circles" title="Find your circle" />,
});
