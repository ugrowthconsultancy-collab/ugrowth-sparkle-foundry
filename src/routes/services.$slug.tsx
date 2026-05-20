import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/StubPage";

export const Route = createFileRoute("/services/$slug")({
  component: () => {
    const { slug } = Route.useParams();
    return <StubPage kicker="Service" title={slug.replace(/-/g, " ")} />;
  },
});
