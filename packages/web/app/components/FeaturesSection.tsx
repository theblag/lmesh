import { LockClosedIcon, FileTextIcon, LightningBoltIcon } from "@radix-ui/react-icons";

export function FeaturesSection() {
  const features = [
    {
      icon: LockClosedIcon,
      title: "Role-based access control",
      description: "Host controls who types, who views.",
    },
    {
      icon: FileTextIcon,
      title: "Command logging",
      description: "Every command logged with user attribution and timestamp.",
    },
    {
      icon: LightningBoltIcon,
      title: "Instant sharing",
      description: "One command to share, collaborators join via browser link, no install needed.",
    },
  ];

  return (
    <section className="w-full max-w-5xl px-4 sm:px-8 py-16 border-t border-(--border-subtle) z-10">
      <div className="mb-10 text-left">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-(--foreground) font-sans">
          Built for security and clarity
        </h2>
        <p className="text-(--text-muted) text-sm mt-2 font-sans">
          Essential tools designed for seamless terminal streaming and control.
        </p>
      </div>

      <div className="bg-(--card-bg) border border-(--border-color) rounded-none overflow-hidden grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-(--border-color)">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <div
              key={idx}
              className="p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:bg-(--card-hover) transition-colors"
            >
              <div>
                <h3 className="text-base font-semibold text-(--foreground) tracking-tight font-sans mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-(--text-muted) leading-relaxed font-sans">
                  {feature.description}
                </p>
              </div>
              <div className="flex items-center gap-2.5 pt-2">
                <div className="w-7 h-7 rounded-md bg-(--card-bg) border border-(--border-color) flex items-center justify-center text-(--foreground) shrink-0">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-mono text-(--text-subtle)">Feature 0{idx + 1}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
