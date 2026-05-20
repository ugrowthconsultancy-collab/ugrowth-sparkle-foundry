import * as React from "react";
import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import {
  getServiceBySlug,
  formatInr,
  estimatedDelivery,
  type ServiceLang,
} from "@/lib/services-catalog";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Check, Clock, Shield, ArrowLeft } from "lucide-react";
import { ServiceIntakeModal } from "@/components/services/ServiceIntakeModal";
import { track } from "@/lib/track";

export const Route = createFileRoute("/services/$slug")({
  loader: ({ params }) => {
    const svc = getServiceBySlug(params.slug);
    if (!svc) throw notFound();
    return { slug: params.slug };
  },
  head: ({ params }) => {
    const svc = getServiceBySlug(params.slug);
    const title = svc
      ? `${svc.content.en.cardName} — ${formatInr(svc.priceInr)}${
          svc.isSubscription ? "/mo" : ""
        } — UGrowth Consultancy`
      : "Service — UGrowth Consultancy";
    return {
      meta: [
        { title },
        { name: "description", content: svc?.content.en.cardDesc ?? "" },
        { property: "og:title", content: title },
        { property: "og:description", content: svc?.content.en.cardDesc ?? "" },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="p-10 text-center">
      <h1 className="font-display text-2xl">Service not found</h1>
      <Link to="/services" className="text-accent underline mt-2 inline-block">
        Back to services
      </Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="p-10 text-center">
      <p className="text-destructive">{error.message}</p>
    </div>
  ),
  component: ServiceDetail,
});

function ServiceDetail() {
  const { slug } = Route.useParams();
  const svc = getServiceBySlug(slug)!;
  const { i18n } = useTranslation();
  useLanguage();
  const lang = (i18n.language?.startsWith("hi") ? "hi" : "en") as ServiceLang;
  const c = svc.content[lang];
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = React.useState(false);

  React.useEffect(() => {
    track("service_detail_view", { service: svc.slug });
  }, [svc.slug]);

  const handleCTA = () => {
    track("service_cta_click", { service: svc.slug });
    if (loading) return;
    if (!user) {
      const here = `/services/${svc.slug}`;
      try {
        sessionStorage.setItem("postLoginRedirect", here);
      } catch {}
      navigate({
        to: "/login",
        search: { redirect: here, message: lang === "hi" ? "जारी रखने के लिए साइन-इन करें" : "Sign in to continue your order" },
      });
      return;
    }
    setModalOpen(true);
  };

  const steps = lang === "hi"
    ? ["सुरक्षित भुगतान करें", "WhatsApp से दस्तावेज़ अपलोड करें", "पार्टनर CA आपकी ओर से फाइल करते हैं", "प्रमाणपत्र प्राप्त करें"]
    : ["Pay securely", "Upload docs via WhatsApp link", "Partner CA files on your behalf", "Receive certificate"];

  // JSON-LD FAQ
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: c.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <main className="flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
        <Link
          to="/services"
          className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          {lang === "hi" ? "सभी सेवाएँ" : "All services"}
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 pb-16 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Left content */}
        <div className="lg:col-span-2 space-y-10">
          <header>
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-primary leading-tight">
              {c.title}
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">{c.heroSubtitle}</p>
          </header>

          <Section title={lang === "hi" ? "आपको क्या मिलेगा" : "What you get"}>
            <ul className="space-y-2">
              {c.whatYouGet.map((it, i) => (
                <li key={i} className="flex gap-2 text-foreground">
                  <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title={lang === "hi" ? "यह कैसे काम करता है" : "How it works"}>
            <ol className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {steps.map((s, i) => (
                <li key={i} className="rounded-lg border border-border bg-card p-4">
                  <div className="font-display text-accent text-sm">
                    {lang === "hi" ? `चरण ${i + 1}` : `Step ${i + 1}`}
                  </div>
                  <div className="mt-1 text-foreground">{s}</div>
                </li>
              ))}
            </ol>
          </Section>

          <Section title={lang === "hi" ? "समय-सीमा" : "Timeline"}>
            <p className="flex items-center gap-2 text-foreground">
              <Clock className="w-5 h-5 text-accent" />
              {c.timelineLabel}
            </p>
          </Section>

          <Section title={lang === "hi" ? "आपसे क्या चाहिए" : "What's required from you"}>
            <ul className="space-y-2">
              {c.requirements.map((it, i) => (
                <li key={i} className="text-foreground">• {it}</li>
              ))}
            </ul>
          </Section>

          <Section title={lang === "hi" ? "अक्सर पूछे जाने वाले प्रश्न" : "FAQ"}>
            <Accordion type="single" collapsible className="w-full">
              {c.faq.map((f, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Section>
        </div>

        {/* Right sticky checkout */}
        <aside className="lg:col-span-1">
          <div className="lg:sticky lg:top-24 rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="font-display text-4xl font-semibold text-primary">
              {formatInr(svc.priceInr)}
              {svc.isSubscription && (
                <span className="text-base font-sans text-muted-foreground">
                  {lang === "hi" ? "/माह" : "/mo"}
                </span>
              )}
            </div>

            <Button
              onClick={handleCTA}
              className="mt-4 w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-medium"
            >
              {lang === "hi" ? "यह करवाएं" : "Get this done"}
            </Button>

            <div className="mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {svc.isSubscription
                  ? lang === "hi"
                    ? "इस महीने से शुरू"
                    : "Starts this month"
                  : `${lang === "hi" ? "अनुमानित डिलीवरी: " : "Est. completion: "} ${estimatedDelivery(svc.timelineDays, lang)}`}
              </div>
            </div>

            <ul className="mt-5 space-y-2 border-t border-border pt-4">
              {c.trust.map((t, i) => (
                <li key={i} className="flex gap-2 text-sm text-foreground">
                  <Shield className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <ServiceIntakeModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        service={svc}
        lang={lang}
      />
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-xl md:text-2xl font-semibold text-primary mb-3">{title}</h2>
      {children}
    </section>
  );
}
