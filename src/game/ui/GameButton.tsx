import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { audio } from "../audio";

const gameButton = cva(
  "font-pixel inline-flex items-center justify-center gap-2 select-none border-[0.2rem] border-ink rounded-lg transition-[transform,box-shadow,filter] duration-75 shadow-[0_0.3rem_0_0_var(--ink)] hover:brightness-110 active:translate-y-[0.2rem] active:shadow-[0_0.1rem_0_0_var(--ink)] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0 disabled:hover:brightness-100 focus-visible:outline-none focus-visible:ring-[0.2rem] focus-visible:ring-cyan",
  {
    variants: {
      variant: {
        primary: "bg-[image:var(--gradient-gold)] text-ink",
        cyan: "bg-cyan text-ink",
        sky: "bg-sky text-navy",
        navy: "bg-navy-2 text-foreground",
        success: "bg-success text-foreground",
        danger: "bg-danger text-foreground",
        white: "bg-card text-navy",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-5 text-base",
        lg: "h-14 px-7 text-xl",
        icon: "h-10 w-10 text-lg",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type Props = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof gameButton> & { silent?: boolean };

export function GameButton({ className, variant, size, silent, onClick, ...props }: Props) {
  return (
    <button
      className={cn(gameButton({ variant, size }), className)}
      onClick={(e) => {
        if (!silent) audio.play("click");
        onClick?.(e);
      }}
      {...props}
    />
  );
}
