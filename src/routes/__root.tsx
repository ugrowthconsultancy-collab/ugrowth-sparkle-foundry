import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { AuthProvider } from "@/hooks/use-auth";
import "@/lib/i18n";
import { useLanguage } from "@/hooks/use-language";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md text-center">
          <h1 className="text-7xl font-semibold text-primary">404</h1>
          <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-5 text-sm font-medium text-accent-foreground hover:bg-accent/90"
            >
              Go home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-5 text-sm font-medium text-accent-foreground hover:bg-accent/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-primary bg-background px-5 text-sm font-medium text-primary hover:bg-primary/5"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "UGrowth Consultancy — Start your own practice in India" },
      {
        name: "description",
        content:
          "Free help to start your own practice in India. Real methodology, real tools, real outcomes. No catch.",
      },
      { name: "author", content: "UGrowth Consultancy Pvt Ltd" },
      { property: "og:title", content: "UGrowth Consultancy — Start your own practice in India" },
      {
        property: "og:description",
        content: "Free help to start your own practice in India. No catch.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "UGrowth Consultancy — Start your own practice in India" },
      { name: "description", content: "UGrowth Foundations provides a foundational design system for a premium Indian platform empowering professionals to launch consulting practices." },
      { property: "og:description", content: "UGrowth Foundations provides a foundational design system for a premium Indian platform empowering professionals to launch consulting practices." },
      { name: "twitter:description", content: "UGrowth Foundations provides a foundational design system for a premium Indian platform empowering professionals to launch consulting practices." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/fe9d1e20-483f-4fcf-8cee-05415498dcc0/id-preview-6632f09e--d3c85c13-0570-4c80-a1d5-5ac2cd5591a7.lovable.app-1779290679412.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/fe9d1e20-483f-4fcf-8cee-05415498dcc0/id-preview-6632f09e--d3c85c13-0570-4c80-a1d5-5ac2cd5591a7.lovable.app-1779290679412.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "preload",
        as: "style",
        href:
          "https://fonts.googleapis.com/css2?family=Inter:wght@400&family=Lora:wght@600&display=swap",
      },
      {
        rel: "stylesheet",
        href:
          "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Lora:wght@500;600;700&family=JetBrains+Mono:wght@400;500&family=Noto+Sans+Devanagari:wght@400;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageBoot />
        <div className="flex min-h-screen flex-col bg-background">
          {!isAdmin && <Header />}
          <main className="flex-1 flex flex-col">
            <Outlet />
          </main>
          {!isAdmin && <Footer />}
          {!isAdmin && <WhatsAppButton variant="fab" context="global_fab" />}
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function LanguageBoot() {
  useLanguage();
  return null;
}
