import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center gap-1 font-semibold transition-colors select-none",
  {
    variants: {
      variant: {
        default:
          "bg-slate-100 text-slate-800 border border-slate-200/80",
        primary:
          "bg-slate-950 text-white border border-slate-900",
        accent:
          "bg-amber-50 text-amber-900 border border-amber-300/80 font-bold",
        discount:
          "bg-rose-500 text-white font-extrabold shadow-2xs",
        success:
          "bg-emerald-50 text-emerald-800 border border-emerald-200/80",
        warning:
          "bg-amber-50 text-amber-800 border border-amber-200/80",
        destructive:
          "bg-rose-50 text-rose-800 border border-rose-200/80",
        outline:
          "border border-slate-200 bg-white text-slate-700",
        hot:
          "bg-amber-500/15 text-amber-900 border border-amber-500/30 font-bold",
      },
      size: {
        sm: "px-2 py-0.5 text-[11px] rounded-md",
        default: "px-2.5 py-0.5 text-xs rounded-lg",
        lg: "px-3 py-1 text-sm rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size, className }))} {...props} />
  );
}
