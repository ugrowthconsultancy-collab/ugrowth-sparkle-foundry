import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/StubPage";

export const Route = createFileRoute("/tools/$slug")({
  component: () => {
    const { slug } = Route.useParams();
    return <StubPage kicker="Free Tool" title={slug.replace(/-/g, " ")} />;
  },
});
