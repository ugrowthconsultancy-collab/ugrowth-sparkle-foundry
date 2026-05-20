import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/use-language";
import { SERVICES, formatInr, type ServiceLang } from "@/lib/services-catalog";
import { ArrowRight, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/services/")({
  head: () => ({
    meta: [
      { title: "Done-for-you Services — UGrowth Consultancy" },
      {
        name: "description",
        content:
          "GST, Udyam, Pvt Ltd, LLP, ROC, EPF, Trademark, FSSAI. Fixed price. Routed to verified Indian CA partners in your city.",
      },
      { property: "og:title", content: "Done-for-you Services — UGrowth Consultancy" },
      { property: "og:description", content: "Fixed price. Clear timeline. No hidden costs." },
    ],
  }),
  component: ServicesIndex,
});

function ServicesIndex() {
  const { i18n } = useTranslation();
  useLanguage();
  const lang = (i18n.language?.startsWith("hi") ? "hi" : "en") as ServiceLang;

  const hero = lang === "hi" ? "हम बोरिंग काम आपके लिए करते हैं" : "We do the boring stuff for you";
  const sub =
    lang === "hi"
      ? "आपके शहर के सत्यापित भारतीय CA को रूट किया गया। तय कीमत। स्पष्ट समय-सीमा। कोई छुपी लागत नहीं।"
      : "Routed to verified Indian Chartered Accountants in your city. Fixed price. Clear timeline. No hidden costs.";
  const ctaLabel = lang === "hi" ? "यह करवाएं" : "Get this done";

  return (
    <main className="flex-1">
      <section className="px-4 md:px-8 py-10 md:py-16 max-w-6xl mx-auto">
        <h1 className="font-display text-3xl md:text-5xl font-semibold text-primary leading-tight">
          {hero}
        </h1>
        <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl">
          {sub}
        </p>
      </section>

      <section className="px-4 md:px-8 pb-16 max-w-6xl mx-auto">
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {SERVICES.map((svc) => {
            const Icon = svc.icon;
            const c = svc.content[lang];
            return (
              <li key={svc.slug}>
                <Link
                  to="/services/$slug"
                  params={{ slug: svc.slug }}
                  className="group h-full flex flex-col rounded-xl border border-border bg-card p-5 hover:border-accent hover:shadow-md transition-all"
                >
                  <div className="w-10 h-10 rounded-md bg-accent/10 text-accent flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h2 className="mt-4 font-display text-lg font-semibold text-primary leading-snug">
                    {c.cardName}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground flex-1">{c.cardDesc}</p>
                  <div className="mt-4 flex items-end justify-between">
                    <div className="font-display text-xl text-primary">
                      {formatInr(svc.priceInr)}
                      {svc.isSubscription && (
                        <span className="text-xs text-muted-foreground font-sans">
                          {lang === "hi" ? "/माह" : "/mo"}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-accent inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                      {ctaLabel}
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-10 rounded-xl border border-dashed border-border bg-muted/30 p-5 md:p-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <MessageCircle className="w-6 h-6 text-accent shrink-0" />
          <p className="text-sm md:text-base text-foreground">
            {lang === "hi"
              ? "कुछ और चाहिए? WhatsApp करें "
              : "Need something else? WhatsApp us at "}
            <span className="font-medium">+91 [WABA placeholder]</span>
          </p>
        </div>
      </section>
    </main>
  );
}
