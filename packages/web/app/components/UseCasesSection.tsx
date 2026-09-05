export function UseCasesSection() {
  const useCases = [
    {
      title: "Technical interviews",
      description: "Interviewer watches candidate's real terminal",
    },
    {
      title: "Pair programming",
      description: "Collaborate on real code in real environment",
    },
    {
      title: "Teaching & mentoring",
      description: "Instructor shares terminal, students follow live",
    },
  ];

  return (
    <section className="w-full max-w-5xl px-4 sm:px-8 py-16 border-t border-(--border-subtle) z-10">
      <div className="mb-10 text-left">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-(--foreground) font-sans">
          Use cases
        </h2>
        <p className="text-(--text-muted) text-sm mt-2 font-sans">
          Built for modern remote teams, interviewers, and educators.
        </p>
      </div>

      <div className="bg-(--card-bg) border border-(--border-color) rounded-none overflow-hidden grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-(--border-color)">
        {useCases.map((useCase, idx) => (
          <div
            key={idx}
            className="p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:bg-(--card-hover) transition-colors"
          >
            <div>
              <h3 className="text-base font-semibold text-(--foreground) tracking-tight font-sans mb-2">
                {useCase.title}
              </h3>
              <p className="text-sm text-(--text-muted) leading-relaxed font-sans">
                {useCase.description}
              </p>
            </div>
            {/* <div className="flex items-center gap-2 pt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
              <span className="text-[11px] font-mono text-white/40">Workflow 0{idx + 1}</span>
            </div> */}
          </div>
        ))}
      </div>
    </section>
  );
}
