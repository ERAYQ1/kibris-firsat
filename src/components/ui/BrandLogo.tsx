import React from "react";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

export function BrandLogo({ size = "md", showText = true, className = "" }: BrandLogoProps) {
  const iconSizes = {
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-11 w-11",
    xl: "h-14 w-14",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-2xl",
  };

  const badgeSizes = {
    sm: "text-[9px]",
    md: "text-[10px]",
    lg: "text-xs",
    xl: "text-sm",
  };

  return (
    <div className={`inline-flex items-center gap-2.5 group ${className}`}>
      {/* Vektörel Logo Amblemi */}
      <div
        className={`relative flex ${iconSizes[size]} shrink-0 items-center justify-center rounded-xl bg-slate-950 p-1.5 shadow-xs transition duration-200 group-hover:scale-105`}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full"
        >
          <defs>
            <linearGradient id="brand-flame" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>
          </defs>
          <path
            d="M16 4.5C16 4.5 17.8 8.8 15.2 11.5C12.5 14.2 10 16 10 19.5C10 23.6 13.1 27 17 27C21.4 27 24.5 23.4 24.5 18.5C24.5 14 21.2 10.5 20.2 8.5C20 10.8 18.5 12.2 17.5 13C16.8 11.5 16.5 7.5 16 4.5Z"
            fill="url(#brand-flame)"
          />
          <path
            d="M16 18C15 19.2 14.5 20.5 14.5 21.8C14.5 23.5 15.8 24.8 17.5 24.8C19.2 24.8 20.5 23.2 20.5 21C20.5 19.2 19 17.5 18 16.5C17.5 17.2 16.8 17.8 16 18Z"
            fill="#FEF3C7"
          />
        </svg>
      </div>

      {/* Tipografi ve Marka İsmi */}
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={`${textSizes[size]} font-black tracking-tight text-slate-950`}>
            Kıbrıs Fırsat
          </span>
          <span
            className={`${badgeSizes[size]} font-extrabold text-amber-700 tracking-wider uppercase`}
          >
            Pazaryeri & Keşif
          </span>
        </div>
      )}
    </div>
  );
}
