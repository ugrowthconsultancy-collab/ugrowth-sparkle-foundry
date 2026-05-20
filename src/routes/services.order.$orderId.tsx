import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/use-language";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { UpiQRCode } from "@/components/UpiQRCode";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import {
  formatInr,
  SERVICES,
  type ServiceLang,
} from "@/lib/services-catalog";
import { getPublicSetting, buildWhatsAppUrl } from "@/lib/app-settings";
import { track } from "@/lib/track";

type Order = {
  id: string;
  order_id_human: string | null;
  service_type: string;
  amount_inr_paise: number;
  status: string;
  created_at: string;
  intake_data: unknown;
};

export const Route = createFileRoute("/services/order/$orderId")({
  head: ({ params }) => ({
    meta: [{ title: `Pay for order ${params.orderId} — UGrowth Consultancy` }],
  }),
  component: OrderCheckoutPage,
});

function OrderCheckoutPage() {
  const { orderId } = Route.useParams();
  const { user, loading } = useAuth();
  const { i18n } = useTranslation();
  useLanguage();
  const lang = (i18n.language?.startsWith("hi") ? "hi" : "en") as ServiceLang;
  const tt = (en: string, hi: string) => (lang === "hi" ? hi : en);

  const [order, setOrder] = React.useState<Order | null>(null);
  const [fetching, setFetching] = React.useState(true);
  const [vpa, setVpa] = React.useState("");
  const [payee, setPayee] = React.useState("");
  const [waPhone, setWaPhone] = React.useState("");
  const [notifying, setNotifying] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const [a, b, c] = await Promise.all([
        getPublicSetting("upi_id"),
        getPublicSetting("upi_payee_name"),
        getPublicSetting("whatsapp_number"),
      ]);
      setVpa(a);
      setPayee(b);
      setWaPhone(c);
    })();
  }, []);

  React.useEffect(() => {
    if (loading) return;
    if (!user) {
      setFetching(false);
      return;
    }
    (async () => {
      const byHuman = await supabase
        .from("service_orders")
        .select("id, order_id_human, service_type, amount_inr_paise, status, created_at, intake_data")
        .eq("order_id_human", orderId)
        .eq("profile_id", user.id)
        .maybeSingle();
      let row = byHuman.data;
      if (!row && /^[0-9a-f-]{36}$/i.test(orderId)) {
        const byId = await supabase
          .from("service_orders")
          .select("id, order_id_human, service_type, amount_inr_paise, status, created_at, intake_data")
          .eq("id", orderId)
          .eq("profile_id", user.id)
          .maybeSingle();
        row = byId.data;
      }
      if (row) {
        setOrder(row as Order);
        track("order_checkout_view", {
          order_id_human: (row as Order).order_id_human,
          service_type: (row as Order).service_type,
        });
      }
      setFetching(false);
    })();
  }, [user, loading, orderId]);

  if (loading || fetching) {
    return (
      <main className="flex-1 flex items-center justify-center py-20">
        <Spinner />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex-1 flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-muted-foreground">
            {tt("Please sign in to view this order.", "इस ऑर्डर को देखने के लिए साइन-इन करें।")}
          </p>
          <Link to="/login" className="text-accent underline mt-2 inline-block">
            {tt("Sign in", "साइन-इन")}
          </Link>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="flex-1 flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-muted-foreground">{tt("Order not found.", "ऑर्डर नहीं मिला।")}</p>
          <Link to="/services" className="text-accent underline mt-2 inline-block">
            {tt("Back to services", "सेवाओं पर लौटें")}
          </Link>
        </div>
      </main>
    );
  }

  const svc = SERVICES.find((s) => s.serviceType === order.service_type);
  const amountInr = order.amount_inr_paise / 100;
  const note = `${order.order_id_human ?? order.id.slice(0, 8)} ${svc?.content.en.cardName ?? order.service_type}`;
  const paid =
    order.status === "paid" || order.status === "in_progress" || order.status === "completed";

  async function notifyPaid() {
    setNotifying(true);
    track("order_paid_notify_clicked", { order_id_human: order!.order_id_human });
    const msg =
      lang === "hi"
        ? `नमस्ते UGrowth team, मैंने ऑर्डर ${order!.order_id_human ?? order!.id} (${formatInr(amountInr)}) के लिए UPI से भुगतान कर दिया है। कृपया verify करें।`
        : `Hi UGrowth team, I've paid ${formatInr(amountInr)} via UPI for order ${order!.order_id_human ?? order!.id}. Please verify.`;
    window.open(buildWhatsAppUrl(waPhone, msg), "_blank", "noopener,noreferrer");
    // soft signal in notes — don't change status; admin verifies manually
    await supabase
      .from("service_orders")
      .update({
        notes: `${tt("Customer says paid via UPI on", "ग्राहक ने UPI से भुगतान बताया")}: ${new Date().toLocaleString("en-IN")}`,
      })
      .eq("id", order!.id);
    toast.success(tt("Thanks! Our team will verify shortly.", "धन्यवाद! हमारी टीम जल्द verify करेगी।"));
    setNotifying(false);
  }

  return (
    <main className="flex-1 px-4 py-10 md:py-14">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/services"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-accent"
        >
          <ArrowLeft className="w-4 h-4" />
          {tt("Back to services", "सेवाओं पर लौटें")}
        </Link>

        <div className="mt-4 grid lg:grid-cols-[1.3fr_1fr] gap-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h1 className="font-display text-2xl font-semibold text-primary">
              {tt("Pay for your order", "अपने ऑर्डर का भुगतान करें")}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {tt("Order", "ऑर्डर")}:{" "}
              <span className="font-mono text-foreground">
                {order.order_id_human ?? order.id}
              </span>
            </p>

            <dl className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <SummaryRow
                label={tt("Service", "सेवा")}
                value={svc?.content[lang].cardName ?? order.service_type}
              />
              <SummaryRow label={tt("Amount", "राशि")} value={formatInr(amountInr)} />
              <SummaryRow
                label={tt("Status", "स्थिति")}
                value={
                  paid ? (
                    <span className="inline-flex items-center gap-1 text-success">
                      <CheckCircle2 className="h-4 w-4" /> {order.status.replace(/_/g, " ")}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" /> {order.status.replace(/_/g, " ")}
                    </span>
                  )
                }
              />
              <SummaryRow
                label={tt("Placed", "बनाया गया")}
                value={new Date(order.created_at).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN")}
              />
            </dl>

            {!paid && (
              <div className="mt-6 border-t border-border pt-6 space-y-4">
                <p className="text-sm text-foreground">
                  {tt(
                    "After paying, tap the button below to notify our team on WhatsApp. We verify and start your filing within a few business hours.",
                    "भुगतान करने के बाद नीचे टैप करके हमारी टीम को WhatsApp पर सूचित करें। हम कुछ ही घंटों में verify करके आपकी filing शुरू कर देंगे।",
                  )}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={notifyPaid}
                    disabled={notifying}
                    className="h-11 bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    {notifying ? tt("Opening WhatsApp…", "WhatsApp खोल रहे हैं…") : tt("I've paid — notify on WhatsApp", "मैंने भुगतान कर दिया — WhatsApp पर सूचित करें")}
                  </Button>
                  <WhatsAppButton
                    variant="ghost"
                    context="order_help"
                    label={tt("Need help?", "मदद चाहिए?")}
                  />
                </div>
              </div>
            )}

            {paid && (
              <div className="mt-6 rounded-lg bg-success/10 border border-success/30 p-4 text-sm text-success-foreground">
                {tt(
                  "Payment received. Our partner CA will reach out shortly with next steps.",
                  "भुगतान प्राप्त हुआ। हमारी partner CA जल्द ही अगले कदम के साथ संपर्क करेगी।",
                )}
              </div>
            )}
          </div>

          <aside className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="font-display text-base font-semibold text-primary text-center">
              {tt("Pay via UPI", "UPI से भुगतान करें")}
            </h2>
            <p className="mt-1 text-center text-xs text-muted-foreground">
              {formatInr(amountInr)}
            </p>
            <div className="mt-4">
              {vpa && payee ? (
                <UpiQRCode
                  vpa={vpa}
                  payeeName={payee}
                  amount={amountInr}
                  note={note}
                  reference={order.order_id_human ?? order.id.slice(0, 12)}
                />
              ) : (
                <div className="flex justify-center py-10">
                  <Spinner />
                </div>
              )}
            </div>
          </aside>
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
