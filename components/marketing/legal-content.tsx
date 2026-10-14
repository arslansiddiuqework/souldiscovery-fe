import { cn } from "@/lib/utils";

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-[#49263D]">{title}</h2>
      <div className="space-y-3 text-[15px] leading-relaxed text-[#795A70]">
        {children}
      </div>
    </section>
  );
}

export function LegalCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto max-w-3xl space-y-8 rounded-[22px] border border-[#EADCE5] bg-white p-6 shadow-[0_8px_28px_rgba(123,57,98,0.07)] md:p-9",
        className
      )}
    >
      {children}
    </div>
  );
}
