import * as React from "react";
import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { toast } from "sonner";
import { Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Spinner } from "@/components/Spinner";
import { AdminSidebarNav } from "@/components/admin/AdminSidebarNav";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — UGrowth Consultancy" }] }),
  component: AdminLayout,
});

const SEGMENT_LABELS: Record<string, string> = {
  admin: "Admin",
  profiles: "Profiles",
  partners: "Partners",
  "ai-conversations": "AI Conversations",
  "tool-outputs": "Tool Outputs",
  "campaign-tracking": "Campaign Tracking",
  "service-orders": "Service Orders",
  "cohort-applications": "Cohort Applications",
  cohorts: "Cohorts",
  subscriptions: "Subscriptions",
  "content-resources": "Content Resources",
  testimonials: "Testimonials",
  waitlists: "Waitlists",
  "admin-logs": "Admin Logs",
};

function AdminLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = React.useState(true);
  const [allowed, setAllowed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/login", search: { message: "Please sign in to continue." } });
      return;
    }
    supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.is_admin) {
          setAllowed(true);
          setChecking(false);
        } else {
          toast.error("Admin access required.");
          navigate({ to: "/dashboard" });
        }
      });
  }, [loading, user, navigate]);

  if (loading || checking) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }
  if (!allowed) return null;

  const segments = pathname.split("/").filter(Boolean);

  return (
    <div className="flex-1 flex bg-background min-h-0">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex w-60 shrink-0 border-r border-border bg-card flex-col">
        <AdminSidebarNav />
      </aside>

      {/* Sidebar — mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-card shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-3 h-12 border-b border-border">
              <span className="font-display text-sm font-semibold text-primary">Admin</span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center justify-center h-10 w-10 rounded-md text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <AdminSidebarNav onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="h-12 flex items-center gap-2 border-b border-border bg-card px-3 lg:px-6">
          <button
            type="button"
            className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-md text-primary"
            onClick={() => setMobileOpen(true)}
            aria-label="Open admin menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
            {segments.map((seg, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="text-muted-foreground/50">/</span>}
                <span className={cn(i === segments.length - 1 && "text-foreground font-medium")}>
                  {SEGMENT_LABELS[seg] ?? seg}
                </span>
              </React.Fragment>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-muted-foreground">
              {user?.email}
            </span>
            <div
              className="h-8 w-8 rounded-full bg-accent text-accent-foreground inline-flex items-center justify-center text-xs font-semibold"
              title={user?.email ?? ""}
            >
              {(user?.email ?? "?").charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
      <Toaster />
    </div>
  );
}
