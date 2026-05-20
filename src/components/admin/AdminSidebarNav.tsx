import * as React from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Users, Handshake, MessageCircle, Wrench, LineChart, Package,
  GraduationCap, Calendar, RefreshCw, FileText, Quote, Clock, Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

const GROUPS: Array<{ label: string; items: Array<{ to: string; label: string; Icon: React.ComponentType<{ className?: string }> }> }> = [
  {
    label: "People",
    items: [
      { to: "/admin/profiles", label: "Profiles", Icon: Users },
      { to: "/admin/partners", label: "Partners", Icon: Handshake },
    ],
  },
  {
    label: "Engagement",
    items: [
      { to: "/admin/ai-conversations", label: "AI Conversations", Icon: MessageCircle },
      { to: "/admin/tool-outputs", label: "Tool Outputs", Icon: Wrench },
      { to: "/admin/campaign-tracking", label: "Campaign Tracking", Icon: LineChart },
    ],
  },
  {
    label: "Commerce",
    items: [
      { to: "/admin/service-orders", label: "Service Orders", Icon: Package },
      { to: "/admin/cohort-applications", label: "Cohort Applications", Icon: GraduationCap },
      { to: "/admin/cohorts", label: "Cohorts", Icon: Calendar },
      { to: "/admin/subscriptions", label: "Subscriptions", Icon: RefreshCw },
    ],
  },
  {
    label: "Content",
    items: [
      { to: "/admin/content-resources", label: "Content Resources", Icon: FileText },
      { to: "/admin/testimonials", label: "Testimonials", Icon: Quote },
    ],
  },
  {
    label: "Leads",
    items: [{ to: "/admin/waitlists", label: "Waitlists", Icon: Clock }],
  },
  {
    label: "Audit",
    items: [{ to: "/admin/admin-logs", label: "Admin Logs", Icon: Shield }],
  },
];

export function AdminSidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="px-3 py-4 space-y-5 overflow-y-auto h-full">
      <Link
        to="/admin"
        onClick={onNavigate}
        className="flex items-center gap-2 px-2 mb-2"
      >
        <span className="font-display text-base font-semibold text-primary tracking-tight">
          UGrowth
        </span>
        <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-accent text-accent-foreground">
          Admin
        </span>
      </Link>
      {GROUPS.map((g) => (
        <div key={g.label}>
          <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {g.label}
          </p>
          <ul className="space-y-0.5">
            {g.items.map(({ to, label, Icon }) => {
              const active = pathname === to || pathname.startsWith(to + "/");
              return (
                <li key={to}>
                  <Link
                    to={to}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2 py-2 text-sm",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-muted",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
