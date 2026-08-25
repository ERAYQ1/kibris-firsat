import {
  ShoppingBag,
  UtensilsCrossed,
  Laptop,
  Shirt,
  Sparkles,
  Package,
  Car,
  Tag,
  Baby,
} from "lucide-react";

interface DealVisualProps {
  imageFilename?: string | null;
  title: string;
  categorySlug: string;
  categoryName: string;
  storeName: string;
  className?: string;
  aspect?: "square" | "video" | "wide";
}

const CATEGORY_VISUALS: Record<
  string,
  {
    bgGradient: string;
    badgeBg: string;
    accentColor: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  market: {
    bgGradient: "from-emerald-600 via-teal-700 to-emerald-900",
    badgeBg: "bg-emerald-500/20 border-emerald-400/30 text-emerald-100",
    accentColor: "#10B981",
    icon: ShoppingBag,
  },
  "restoran-kafe": {
    bgGradient: "from-orange-600 via-amber-700 to-amber-900",
    badgeBg: "bg-orange-500/20 border-orange-400/30 text-orange-100",
    accentColor: "#F59E0B",
    icon: UtensilsCrossed,
  },
  restoran: {
    bgGradient: "from-orange-600 via-amber-700 to-amber-900",
    badgeBg: "bg-orange-500/20 border-orange-400/30 text-orange-100",
    accentColor: "#F59E0B",
    icon: UtensilsCrossed,
  },
  elektronik: {
    bgGradient: "from-indigo-600 via-blue-700 to-slate-900",
    badgeBg: "bg-blue-500/20 border-blue-400/30 text-blue-100",
    accentColor: "#3B82F6",
    icon: Laptop,
  },
  giyim: {
    bgGradient: "from-purple-600 via-fuchsia-700 to-purple-950",
    badgeBg: "bg-purple-500/20 border-purple-400/30 text-purple-100",
    accentColor: "#A855F7",
    icon: Shirt,
  },
  kozmetik: {
    bgGradient: "from-rose-500 via-pink-600 to-rose-950",
    badgeBg: "bg-pink-500/20 border-pink-400/30 text-pink-100",
    accentColor: "#EC4899",
    icon: Sparkles,
  },
  "ev-yasam": {
    bgGradient: "from-teal-600 via-cyan-700 to-slate-900",
    badgeBg: "bg-teal-500/20 border-teal-400/30 text-teal-100",
    accentColor: "#14B8A6",
    icon: Package,
  },
  otomotiv: {
    bgGradient: "from-slate-700 via-slate-800 to-slate-950",
    badgeBg: "bg-slate-500/20 border-slate-400/30 text-slate-200",
    accentColor: "#64748B",
    icon: Car,
  },
  bebek: {
    bgGradient: "from-amber-500 via-orange-600 to-yellow-800",
    badgeBg: "bg-yellow-500/20 border-yellow-400/30 text-yellow-100",
    accentColor: "#EAB308",
    icon: Baby,
  },
};

export function DealVisual({
  imageFilename,
  title,
  categorySlug,
  categoryName,
  storeName,
  className = "",
  aspect = "wide",
}: DealVisualProps) {
  const aspectClass =
    aspect === "square"
      ? "aspect-square"
      : aspect === "video"
      ? "aspect-video"
      : "aspect-16/10";

  if (imageFilename) {
    return (
      <div
        className={`relative w-full overflow-hidden bg-slate-100 ${aspectClass} ${className}`}
      >
        <img
          src={`/api/images/${imageFilename}`}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
    );
  }

  const visual = CATEGORY_VISUALS[categorySlug] || {
    bgGradient: "from-slate-800 via-slate-900 to-slate-950",
    badgeBg: "bg-slate-700/30 border-slate-600/40 text-slate-200",
    accentColor: "#F59E0B",
    icon: Tag,
  };

  const Icon = visual.icon;

  // Mağaza baş harfi
  const storeInitials = storeName
    ? storeName
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase())
        .join("")
    : "KF";

  const isThumbnail = aspect === "square";

  return (
    <div
      className={`relative w-full overflow-hidden bg-gradient-to-br ${visual.bgGradient} p-3 sm:p-4 flex flex-col justify-between select-none ${aspectClass} ${className}`}
    >
      {/* İnce Geometrik Grid Deseni */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "16px 16px",
        }}
      />

      {/* Parlama Efekti */}
      <div className="absolute -top-12 -right-12 h-28 w-28 rounded-full bg-white/10 blur-xl pointer-events-none" />

      {/* Üst Bar (Thumbnail'de sadece sağ inisiyal, genişte sol kategori ve sağ inisiyal) */}
      <div className={`relative z-10 flex items-center gap-1.5 ${isThumbnail ? "justify-end" : "justify-between"}`}>
        {!isThumbnail && (
          <span
            className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[10px] font-bold tracking-wide backdrop-blur-xs ${visual.badgeBg}`}
          >
            <Icon className="h-3 w-3" />
            <span>{categoryName}</span>
          </span>
        )}

        <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-md sm:rounded-lg bg-white/15 backdrop-blur-xs text-[9px] sm:text-[10px] font-black text-white border border-white/20 shadow-xs">
          {storeInitials}
        </span>
      </div>

      {/* Merkez: Büyük 3D-stil Kategori İkonu */}
      <div className="relative z-10 my-auto flex flex-col items-center justify-center text-center">
        <div
          className={`flex items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-md text-white group-hover:scale-110 transition-transform duration-300 ${
            isThumbnail ? "h-11 w-11 sm:h-12 sm:w-12" : "h-14 w-14"
          }`}
        >
          <Icon
            className={`${
              isThumbnail ? "h-5 w-5 sm:h-6 sm:w-6" : "h-7 w-7"
            } stroke-[1.8] text-white`}
          />
        </div>
      </div>

      {/* Alt Bar (Yalnızca geniş modda gösterilir) */}
      {!isThumbnail && (
        <div className="relative z-10 flex items-center justify-between text-[11px] text-white/80 font-medium">
          <span className="truncate max-w-[130px]">{storeName}</span>
          <span className="text-[10px] font-bold text-amber-300/90 uppercase tracking-wider">
            Kıbrıs Fırsat
          </span>
        </div>
      )}
    </div>
  );
}
