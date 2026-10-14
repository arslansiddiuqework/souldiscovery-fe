import { cn } from "@/lib/utils";

export function InfoPageShell({
  badge,
  title,
  description,
  children,
  className,
}: {
  badge: string;
  title: React.ReactNode;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("page-shell relative text-[#49263D]", className)}>
      <div className="container-app section-padding relative z-10">
        <div className="mx-auto mb-8 max-w-3xl text-center md:mb-10">
          <span className="badge-soft mb-4">{badge}</span>
          <h1 className="text-4xl font-bold tracking-tight text-[#49263D] md:text-5xl lg:text-[52px]">
            {title}
          </h1>
          {description ? (
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#795A70] md:text-lg">
              {description}
            </p>
          ) : null}
        </div>
        {children}
      </div>
    </div>
  );
}
