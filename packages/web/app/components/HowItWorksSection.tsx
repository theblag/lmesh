export function HowItWorksSection() {
  const steps = [
    {
      step: "01",
      title: "Run command",
      content: (
        <>
          Host runs <code className="font-mono text-[var(--foreground)] bg-[var(--card-bg)] px-1.5 py-0.5 rounded border border-[var(--border-color)]">lmesh share</code> in their terminal
        </>
      ),
    },
    {
      step: "02",
      title: "Share link",
      content: "Share the generated link with collaborators",
    },
    {
      step: "03",
      title: "Join & collaborate",
      content: "Collaborators join in browser, view or request control",
    },
  ];

  return (
    <section className="w-full max-w-5xl px-4 sm:px-8 py-16 border-t border-[var(--border-subtle)] z-10">
      <div className="mb-12 text-left">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)] font-sans">
          How it works
        </h2>
        <p className="text-[var(--text-muted)] text-sm mt-2 font-sans">
          Start sharing your active terminal session in seconds.
        </p>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-none overflow-hidden grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--border-color)]">
        {steps.map((item, idx) => (
          <div
            key={idx}
            className="p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:bg-[var(--card-hover)] transition-colors"
          >
            <div>
              <h3 className="text-base font-semibold text-[var(--foreground)] tracking-tight font-sans mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed font-sans">
                {item.content}
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <span className="font-mono text-xs font-semibold text-[var(--text-subtle)] tracking-wider">
                Step {item.step}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
