import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/StubPage";

export const Route = createFileRoute("/ai-advisor")({
  component: () => <StubPage kicker="AI Advisor" title="Ask anything about your practice" />,
});
