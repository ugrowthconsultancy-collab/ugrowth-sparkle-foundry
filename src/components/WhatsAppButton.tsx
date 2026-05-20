import * as React from "react";
import { useTranslation } from "react-i18next";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildWhatsAppUrl, getPublicSetting } from "@/lib/app-settings";
import { track } from "@/lib/track";

type Variant = "fab" | "inline" | "ghost";

export function WhatsAppButton({
  message,
  context = "general",
  variant = "fab",
  className,
  label,
}: {
  /** Optional pre-filled message; falls back to the language-specific default from app_settings. */
  message?: string;
  /** Where the button was clicked from — used for tracking. */
  context?: string;
  variant?: Variant;
  className?: string;
  label?: string;
}) {
  const { i18n, t } = useTranslation();
  const lang = i18n.language?.startsWith("hi") ? "hi" : "en";
  const [url, setUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      const [phone, defMsg] = await Promise.all([
        getPublicSetting("whatsapp_number"),
        getPublicSetting(
          lang === "hi" ? "whatsapp_default_message_hi" : "whatsapp_default_message_en",
        ),
      ]);
      if (!alive) return;
      setUrl(buildWhatsAppUrl(phone, message ?? defMsg));
    })();
    return () => {
      alive = false;
    };
  }, [lang, message]);

  if (!url) return null;

  const handleClick = () => {
    track("whatsapp_click", { context, lang });
  };

  const text = label ?? t("whatsapp.cta", { defaultValue: "Chat on WhatsApp" });

  if (variant === "fab") {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        aria-label={text}
        className={cn(
          "fixed z-40 bottom-5 right-5 inline-flex items-center justify-center h-14 w-14 rounded-full bg-[#25D366] text-white shadow-lg hover:scale-105 transition-transform",
          className,
        )}
      >
        <MessageCircle className="h-6 w-6" />
      </a>
    );
  }

  if (variant === "ghost") {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className={cn(
          "inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[#25D366] transition-colors",
          className,
        )}
      >
        <MessageCircle className="h-4 w-4" />
        {text}
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={cn(
        "inline-flex items-center gap-2 h-11 px-4 rounded-md bg-[#25D366] hover:bg-[#1ebe5a] text-white font-medium transition-colors",
        className,
      )}
    >
      <MessageCircle className="h-4 w-4" />
      {text}
    </a>
  );
}
