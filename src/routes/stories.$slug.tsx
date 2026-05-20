import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/StubPage";

export const Route = createFileRoute("/stories/$slug")({
  component: () => {
    const { slug } = Route.useParams();
    return <StubPage kicker="Founder Story" title={slug.replace(/-/g, " ")} />;
  },
});
