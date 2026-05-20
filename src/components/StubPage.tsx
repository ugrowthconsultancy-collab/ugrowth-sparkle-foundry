export function StubPage({ title, kicker }: { title: string; kicker?: string }) {
  return (
    <section className="flex-1 flex items-center justify-center px-4 py-24">
      <div className="max-w-xl text-center">
        {kicker && (
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">{kicker}</p>
        )}
        <h1 className="mt-4 text-3xl md:text-4xl font-semibold text-primary">{title}</h1>
        <p className="mt-4 text-muted-foreground">Coming soon.</p>
      </div>
    </section>
  );
}
