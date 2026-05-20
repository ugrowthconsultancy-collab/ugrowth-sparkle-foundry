// Server-only Gemini helper. Do NOT import in client code.
const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

export type GeminiModel = "gemini-1.5-flash" | "gemini-1.5-pro";

export type GeminiMessage = { role: "user" | "model"; content: string };

export const UGROWTH_SYSTEM_PROMPT = `You are the UGrowth Advisor — a warm, sharp, no-fluff coach inside UGrowth Consultancy, an Indian platform that helps salaried professionals, side-hustlers, and freelancers turn their expertise into a real consulting / services practice.

Voice & style:
- Speak like a friendly Indian mentor (Captain). Direct, practical, encouraging — never preachy.
- Mix English freely with Hindi/Hinglish when the user does, but match the user's language by default.
- Short paragraphs. Use bullets, ₹ for money, lakh/crore where natural.
- Cite India-specific realities: GST, Udyam, MSME, freelancer taxation, UPI, tier-1/2/3 cities.
- When relevant, nudge users to UGrowth's free tools (Niche Generator, Rate Card Builder), the AI Advisor itself, the MEPSC-certified cohort, or DFY services (GST registration, Udyam, incorporation).
- Never invent legal/tax guarantees. If unsure, say so and recommend consulting our partner CA.
- Refuse harmful, discriminatory, or unrelated requests politely.

You are a chat — keep replies focused (usually under ~180 words) unless the user asks for depth.`;

export async function callGemini(opts: {
  model?: GeminiModel;
  history: GeminiMessage[];
  systemPrompt?: string;
  temperature?: number;
  maxOutputTokens?: number;
}): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not configured");
  const model = opts.model ?? "gemini-1.5-flash";
  const body = {
    systemInstruction: opts.systemPrompt
      ? { role: "system", parts: [{ text: opts.systemPrompt }] }
      : undefined,
    contents: opts.history.map((m) => ({
      role: m.role,
      parts: [{ text: m.content }],
    })),
    generationConfig: {
      temperature: opts.temperature ?? 0.7,
      maxOutputTokens: opts.maxOutputTokens ?? 1024,
    },
  };
  const url = `${API_BASE}/${model}:generateContent?key=${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini ${res.status}: ${text.slice(0, 400)}`);
  }
  const json: {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  } = await res.json();
  const text = json.candidates?.[0]?.content?.parts
    ?.map((p) => p.text ?? "")
    .join("")
    .trim();
  if (!text) throw new Error("Gemini returned no text");
  return text;
}

/** Pick model based on question complexity (length + keywords). */
export function pickModel(userText: string): GeminiModel {
  const t = userText.trim();
  if (t.length > 400) return "gemini-1.5-pro";
  if (/\b(strategy|roadmap|plan|legal|gst|tax|incorporat|compliance|pricing model|business model)\b/i.test(t))
    return "gemini-1.5-pro";
  return "gemini-1.5-flash";
}
