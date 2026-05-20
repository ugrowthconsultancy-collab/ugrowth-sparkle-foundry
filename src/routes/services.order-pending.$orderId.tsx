import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/use-language";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { formatInr, SERVICES, type ServiceLang } from "@/lib/services-catalog";

type Order = {
  id: string;
  order_id_human: string | null;
  service_type: string;
  amount_inr_paise: number;
  status: string;
  created_at: string;
};

type Subscription = {
  id: string;
  product: string;
  billing_cycle: string;
  amount_inr_paise: number;
  status: string;
  created_at: string;
};

export const Route = createFileRoute("/services/order-pending/$orderId")({
  head: () => ({
    meta: [{ title: "Order received — UGrowth Consultancy" }],
  }),
  component: OrderPendingPage,
});

function OrderPendingPage() {
  const { orderId } = Route.useParams();
  const { user, loading } = useAuth();
  const { i18n } = useTranslation();
  useLanguage();
  const lang = (i18n.language?.startsWith("hi") ? "hi" : "en") as ServiceLang;
  const [order, setOrder] = React.useState<Order | null>(null);
  const [subscription, setSubscription] = React.useState<Subscription | null>(null);
  const [fetching, setFetching] = React.useState(true);

  React.useEffect(() => {
    if (loading) return;
    if (!user) {
      setFetching(false);
      return;
    }
    (async () => {
      // Try service_orders (by human id, then by uuid)
      const byHuman = await supabase
        .from("service_orders")
        .select("id, order_id_human, service_type, amount_inr_paise, status, created_at")
        .eq("order_id_human", orderId)
        .eq("profile_id", user.id)
        .maybeSingle();

      if (byHuman.data) {
        setOrder(byHuman.data as Order);
        setFetching(false);
        return;
      }

      const isUuid = /^[0-9a-f-]{36}$/i.test(orderId);
      if (isUuid) {
        const byId = await supabase
          .from("service_orders")
          .select("id, order_id_human, service_type, amount_inr_paise, status, created_at")
          .eq("id", orderId)
          .eq("profile_id", user.id)
          .maybeSingle();
        if (byId.data) {
          setOrder(byId.data as Order);
          setFetching(false);
          return;
        }
        const sub = await supabase
          .from("subscriptions")
          .select("id, product, billing_cycle, amount_inr_paise, status, created_at")
          .eq("id", orderId)
          .eq("profile_id", user.id)
          .maybeSingle();
        if (sub.data) setSubscription(sub.data as Subscription);
      }
      setFetching(false);
    })();
  }, [user, loading, orderId]);

  const tt = (en: string, hi: string) => (lang === "hi" ? hi : en);

  const svc = order
    ? SERVICES.find((s) => s.serviceType === order.service_type)
    : subscription
    ? SERVICES.find((s) => s.serviceType === "compliance_subscription")
    : null;

  return (
    <main className="flex-1 px-4 py-10 md:py-16">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-xl border border-border bg-card p-6 md:p-8 shadow-sm">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-8 h-8 text-accent shrink-0" />
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-semibold text-primary">
                {tt("Order received", "ऑर्डर प्राप्त हुआ")}: {order?.order_id_human ?? orderId}
              </h1>
              <p className="mt-2 text-muted-foreground">
                {tt(
                  "Payment integration coming soon — order saved. Our team will reach out via email within 24 hours to complete payment and start your filing.",
                  "भुगतान इंटीग्रेशन जल्द आ रहा है — ऑर्डर सहेजा गया। 24 घंटे के भीतर हमारी टीम ईमेल पर संपर्क करेगी।",
                )}
              </p>
            </div>
          </div>

          {fetching && (
            <p className="mt-6 text-sm text-muted-foreground">{tt("Loading order…", "लोड हो रहा है…")}</p>
          )}

          {!fetching && !order && !subscription && (
            <p className="mt-6 text-sm text-muted-foreground">
              {tt(
                "We saved your order. Sign in to see the full summary.",
                "हमने आपका ऑर्डर सहेज लिया है। पूरी जानकारी देखने हेतु साइन-इन करें।",
              )}
            </p>
          )}

          {(order || subscription) && (
            <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <SummaryRow
                label={tt("Service", "सेवा")}
                value={svc?.content[lang].cardName ?? (order?.service_type || subscription?.product || "—")}
              />
              <SummaryRow
                label={tt("Amount", "राशि")}
                value={
                  order
                    ? formatInr(order.amount_inr_paise / 100)
                    : subscription
                    ? `${formatInr(subscription.amount_inr_paise / 100)}${tt("/mo", "/माह")}`
                    : "—"
                }
              />
              <SummaryRow
                label={tt("Status", "स्थिति")}
                value={(order?.status ?? subscription?.status ?? "—").replace(/_/g, " ")}
              />
              <SummaryRow
                label={tt("Created", "बनाया गया")}
                value={new Date((order?.created_at ?? subscription?.created_at) as string).toLocaleString(
                  lang === "hi" ? "hi-IN" : "en-IN",
                )}
              />
            </dl>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/services"
              className="inline-flex items-center gap-1 text-accent hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              {tt("Back to services", "सेवाओं पर लौटें")}
            </Link>
            <Link
              to="/dashboard"
              className="ml-auto inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              {tt("Go to dashboard", "डैशबोर्ड पर जाएं")}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md bg-muted/40 px-3 py-2">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-foreground font-medium">{value}</dd>
    </div>
  );
}
