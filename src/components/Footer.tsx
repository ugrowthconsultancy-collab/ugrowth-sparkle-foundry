import { Link } from "@tanstack/react-router";
import { Linkedin, Instagram, Youtube } from "lucide-react";
import { useTranslation } from "react-i18next";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export function Footer() {
  const { t } = useTranslation();
  const COLS = [
    {
      title: "PRODUCTS",
      links: [
        { label: t("nav.findMentor"), to: "/find-a-mentor" },
        { label: t("nav.cohort"), to: "/cohort" },
        { label: t("nav.services"), to: "/services" },
        { label: t("nav.resources"), to: "/resources" },
      ],
    },
    {
      title: "RESOURCES",
      links: [
        { label: t("nav.resources"), to: "/resources" },
        { label: "Blog", to: "/blog" },
        { label: "FAQ", to: "/faq" },
      ],
    },
    {
      title: "LEGAL",
      links: [
        { label: "Privacy Policy", to: "/privacy" },
        { label: "Terms of Service", to: "/terms" },
        { label: "DPDP Compliance", to: "/dpdp" },
        { label: "Grievance Officer", to: "/grievance" },
        { label: "Contact", to: "/contact" },
      ],
    },
  ] as const;
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="mx-auto max-w-[1280px] px-4 lg:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="font-display text-xl font-semibold text-primary">
              UGrowth Consultancy
            </div>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-xs">
              {t("footer.tagline")}
            </p>
            <p className="mt-4 text-xs text-muted-foreground">UGrowth Consultancy Pvt Ltd</p>
          </div>

          {COLS.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-foreground tracking-wide uppercase font-sans">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-muted-foreground hover:text-accent transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border grid gap-4 md:grid-cols-2">
          <div className="text-xs text-muted-foreground leading-relaxed">
            {t("footer.cert")}
          </div>
          <div className="text-xs text-muted-foreground leading-relaxed md:text-right">
            {t("footer.affil")}
          </div>
        </div>

        <div className="mt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            {t("footer.copyright")}
          </p>
          <div className="flex items-center gap-2">
            <WhatsAppButton variant="ghost" context="footer" />
            <a
              href="#"
              aria-label="LinkedIn"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-accent hover:border-accent transition-colors"
            >
              <Linkedin className="h-4 w-4" />
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-accent hover:border-accent transition-colors"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="#"
              aria-label="YouTube"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-accent hover:border-accent transition-colors"
            >
              <Youtube className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
