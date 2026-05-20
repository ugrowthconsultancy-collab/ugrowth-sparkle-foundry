import * as React from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { supabase } from "@/integrations/supabase/client";

export function Header() {
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const { t } = useTranslation();
  const { lang, setLang } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = React.useState<string>("");

  const NAV = React.useMemo(
    () =>
      [
        { to: "/find-a-mentor", label: t("nav.findMentor") },
        { to: "/resources", label: t("nav.resources") },
        { to: "/cohort", label: t("nav.cohort") },
        { to: "/services", label: t("nav.services") },
        { to: "/about", label: t("nav.about") },
      ] as const,
    [t],
  );

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  React.useEffect(() => {
    if (!user) {
      setDisplayName("");
      return;
    }
    supabase
      .from("profiles")
      .select("preferred_name, full_name")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setDisplayName(
          data?.preferred_name || data?.full_name || user.email || "",
        );
      });
  }, [user]);

  async function logout() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  const initial = (displayName || user?.email || "?").trim().charAt(0).toUpperCase();

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full bg-card transition-shadow",
        scrolled ? "shadow-[0_1px_3px_rgba(0,0,0,0.06)]" : "border-b border-border",
      )}
    >
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 lg:px-6 h-16">
        <Link to="/" className="font-display text-xl font-semibold text-primary tracking-tight">
          UGrowth Consultancy
        </Link>

        <nav className="hidden lg:flex items-center gap-7">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-sm text-foreground hover:text-accent transition-colors"
              activeProps={{ className: "text-accent font-medium" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <LanguageToggle lang={lang} onChange={setLang} />
          {user ? (
            <AvatarMenu initial={initial} onLogout={logout} t={t} />
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">{t("nav.login")}</Link>
            </Button>
          )}
        </div>

        <div className="lg:hidden flex items-center gap-2">
          {user && <AvatarMenu initial={initial} onLogout={logout} t={t} />}
          <button
            type="button"
            className="inline-flex items-center justify-center min-h-11 min-w-11 rounded-md text-primary"
            aria-label={t("nav.menu")}
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-card shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-4 h-16 border-b border-border">
              <span className="font-display text-lg font-semibold text-primary">{t("nav.menu")}</span>
              <button
                type="button"
                className="inline-flex items-center justify-center min-h-11 min-w-11 rounded-md text-primary"
                aria-label="Close"
                onClick={() => setOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex flex-col p-4 gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="px-3 py-3 rounded-md text-base text-foreground hover:bg-muted"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto p-4 border-t border-border space-y-3">
              <LanguageToggle lang={lang} onChange={setLang} />
              {user ? (
                <>
                  <Button variant="ghost" className="w-full" asChild>
                    <Link to="/dashboard" onClick={() => setOpen(false)}>
                      {t("nav.dashboard")}
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setOpen(false);
                      logout();
                    }}
                  >
                    {t("nav.logout")}
                  </Button>
                </>
              ) : (
                <Button variant="ghost" className="w-full" asChild>
                  <Link to="/login" onClick={() => setOpen(false)}>
                    {t("nav.login")}
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function AvatarMenu({
  initial,
  onLogout,
  t,
}: {
  initial: string;
  onLogout: () => void;
  t: (k: string) => string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-accent text-accent-foreground font-semibold text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          {initial}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link to="/dashboard">{t("nav.dashboard")}</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/profile">{t("nav.profile")}</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings">{t("nav.settings")}</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout}>{t("nav.logout")}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function LanguageToggle({
  lang,
  onChange,
}: {
  lang: "en" | "hi";
  onChange: (l: "en" | "hi") => void;
}) {
  return (
    <div
      role="group"
      aria-label="Language"
      className="inline-flex rounded-full border border-border p-0.5 bg-background"
    >
      <button
        type="button"
        onClick={() => onChange("en")}
        aria-pressed={lang === "en"}
        className={cn(
          "px-3 py-1 text-xs font-medium rounded-full transition-colors",
          lang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
        )}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => onChange("hi")}
        aria-pressed={lang === "hi"}
        className={cn(
          "px-3 py-1 text-xs font-medium rounded-full transition-colors font-hindi",
          lang === "hi" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
        )}
      >
        हिंदी
      </button>
    </div>
  );
}
