import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

import { PhoneInput } from "@/components/PhoneInput";
import { MultiSelect } from "@/components/MultiSelect";
import { EmptyState } from "@/components/EmptyState";
import { Spinner } from "@/components/Spinner";
import { formatINR, formatIndianPhone } from "@/lib/format";

export const Route = createFileRoute("/preview-components")({
  head: () => ({
    meta: [
      { title: "Component Preview — UGrowth Consultancy (Internal)" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PreviewComponents,
});

const SECTORS = [
  { label: "GST & Compliance", value: "gst" },
  { label: "MSME Loans", value: "msme" },
  { label: "Branding", value: "brand" },
  { label: "HR & Hiring", value: "hr" },
  { label: "Digital Marketing", value: "digital" },
];

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-10 border-b border-border last:border-b-0">
      <header className="mb-6">
        <h2 className="text-2xl text-primary">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </header>
      {children}
    </section>
  );
}

function PreviewComponents() {
  const [single, setSingle] = React.useState<string>("");
  const [multi, setMulti] = React.useState<string[]>(["gst", "msme"]);
  const [phone, setPhone] = React.useState("");
  const [amount, setAmount] = React.useState(123456);

  return (
    <div className="mx-auto max-w-[1280px] px-4 lg:px-6 py-12">
      <header className="mb-12 max-w-3xl">
        <Badge variant="outline">Internal QA</Badge>
        <h1 className="mt-4 text-4xl text-primary">Component preview</h1>
        <p className="mt-3 text-base text-muted-foreground">
          Every reusable component, every variant, every state. Use this page to
          verify the design system before shipping anything visible to users.
        </p>
      </header>

      <Section
        title="Buttons"
        description="Primary = saffron. Secondary = navy. Ghost = navy outline. Destructive = red."
      >
        <div className="flex flex-wrap gap-4">
          <Button>Primary action</Button>
          <Button variant="secondary">Secondary action</Button>
          <Button variant="ghost">Ghost action</Button>
          <Button variant="destructive">Destructive</Button>
          <Button disabled>Disabled</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" aria-label="Add"><Plus /></Button>
        </div>
      </Section>

      <Section title="Inputs">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" placeholder="Anjali Sharma" />
            <p className="text-xs text-muted-foreground">As per your PAN.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Mobile number</Label>
            <PhoneInput
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              We'll send an OTP. Standard SMS rates may apply.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Revenue (₹)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="bio">About your practice</Label>
            <Textarea id="bio" placeholder="Tell us in a few lines..." rows={4} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="err" className="text-destructive">Email (error state)</Label>
            <Input
              id="err"
              defaultValue="not-an-email"
              aria-invalid
              className="border-destructive focus-visible:ring-destructive"
            />
            <p className="text-xs text-destructive">Please enter a valid email address.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone-err">Mobile (error state)</Label>
            <PhoneInput id="phone-err" error defaultValue="999" />
            <p className="text-xs text-destructive">Mobile number must be 10 digits.</p>
          </div>
        </div>
      </Section>

      <Section title="Select & Multi-select" description="Single + multi, both searchable.">
        <div className="grid gap-6 md:grid-cols-2 max-w-3xl">
          <div className="space-y-2">
            <Label>Primary sector (single)</Label>
            <Select value={single} onValueChange={setSingle}>
              <SelectTrigger className="min-h-11">
                <SelectValue placeholder="Choose a sector" />
              </SelectTrigger>
              <SelectContent>
                {SECTORS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Sectors you can mentor (multi)</Label>
            <MultiSelect options={SECTORS} value={multi} onChange={setMulti} />
          </div>
        </div>
      </Section>

      <Section title="Cards">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Free starter kit</CardTitle>
              <CardDescription>Everything to launch your practice in 30 days.</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="free">Free</Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Mentor cohort</CardTitle>
              <CardDescription>Twelve weeks with a verified practitioner.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-display text-primary">{formatINR(15000)}</p>
              <p className="text-xs text-muted-foreground mt-1">per cohort, GST included</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Done-for-you</CardTitle>
              <CardDescription>We set up your business in a fortnight.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-display text-primary">{formatINR(125000)}</p>
              <p className="text-xs text-muted-foreground mt-1">one-time, GST extra</p>
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section title="Badges">
        <div className="flex flex-wrap gap-3">
          <Badge variant="free">Free</Badge>
          <Badge variant="new">New</Badge>
          <Badge variant="certified">MEPSC Certificate</Badge>
          <Badge variant="govt">Captain-Led</Badge>
          <Badge variant="default">Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>
      </Section>

      <Section title="Modal / Dialog">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="secondary">Open dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Book a free consultation</DialogTitle>
              <DialogDescription>
                Tell us about your practice. One of our mentors will get back within
                24 hours. No catch.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="d-name">Name</Label>
                <Input id="d-name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="d-phone">Mobile</Label>
                <PhoneInput id="d-phone" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost">Cancel</Button>
              <Button>Send request</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Section>

      <Section title="Loading & skeletons">
        <div className="flex items-center gap-6 mb-6">
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-2/3 mt-2" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </Section>

      <Section title="Empty state">
        <EmptyState
          icon={<Search className="h-8 w-8" />}
          title="No mentors found"
          description="Try clearing your filters or expanding the city range. New mentors join every week."
          action={<Button><Sparkles /> Browse all mentors</Button>}
        />
      </Section>

      <Section
        title="Indian formatters"
        description="Rupees use lakhs/crores grouping. Phone numbers use +91 with 5-5 spacing."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Rupee (₹) formatter</CardTitle>
              <CardDescription>1,23,456 — not 123,456.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 font-mono text-sm">
                <li>{formatINR(500)}</li>
                <li>{formatINR(12500)}</li>
                <li>{formatINR(123456)}</li>
                <li>{formatINR(1234567)}</li>
                <li>{formatINR(12345678)}</li>
                <li>{formatINR(123456789)}</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Phone formatter</CardTitle>
              <CardDescription>+91 XXXXX XXXXX.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 font-mono text-sm">
                <li>{formatIndianPhone("9876543210")}</li>
                <li>{formatIndianPhone("+919999988888")}</li>
                <li>{formatIndianPhone("8888-77-66555")}</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section title="Typography">
        <div className="space-y-3">
          <h1 className="text-5xl">Heading 1 — Lora 600</h1>
          <h2 className="text-4xl">Heading 2 — Lora 600</h2>
          <h3 className="text-3xl">Heading 3 — Lora 600</h3>
          <h4 className="text-2xl">Heading 4 — Lora 600</h4>
          <p className="text-base">
            Body — Inter 400. The quick brown fox jumps over the lazy dog. ₹1,23,456.
          </p>
          <p className="font-hindi text-base">
            हिंदी पाठ — नोटो सैंस देवनागरी में। निःशुल्क सहायता उपलब्ध है।
          </p>
          <p className="font-mono text-sm">JetBrains Mono — const x = 1;</p>
        </div>
      </Section>

      <Section title="Color tokens">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: "Primary #0F2A4A", cls: "bg-primary text-primary-foreground" },
            { name: "Accent #E08A1E", cls: "bg-accent text-accent-foreground" },
            { name: "Success #1B7F4F", cls: "bg-success text-success-foreground" },
            { name: "Destructive #C0392B", cls: "bg-destructive text-destructive-foreground" },
            { name: "Background #FAFAF7", cls: "bg-background text-foreground border border-border" },
            { name: "Foreground #1A1A1A", cls: "bg-foreground text-background" },
            { name: "Muted-fg #5A5A5A", cls: "bg-muted text-muted-foreground" },
            { name: "Border #E5E5E0", cls: "bg-background text-foreground border-2 border-border" },
          ].map((s) => (
            <div key={s.name} className={`rounded-lg p-6 text-sm font-medium ${s.cls}`}>
              {s.name}
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
