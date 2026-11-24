import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, size = "lg" }: { className?: string; size?: "md" | "lg" }) {
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="flex items-center gap-3">
        <ShieldCheck className={cn("animate-glow text-cyan", size === "lg" ? "h-20 w-20" : "h-12 w-12")} strokeWidth={2.4} />
        <h1 className={cn("font-pixel text-shadow-pixel leading-none font-bold tracking-wider text-foreground", size === "lg" ? "text-8xl" : "text-6xl")}>
          DIGI<span className="text-cyan">SAFE</span>
        </h1>
      </div>
      <p className={cn("font-pixel text-shadow-pixel mt-3 text-gold", size === "lg" ? "text-xl" : "text-base")}>
        Digital Investigation &amp; Cyber Safety Adventure
      </p>
    </div>
  );
}
