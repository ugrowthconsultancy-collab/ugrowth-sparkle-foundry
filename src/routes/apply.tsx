import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/StubPage";

export const Route = createFileRoute("/apply")({
  component: () => <StubPage kicker="Cohort" title="Apply for the next batch" />,
});
