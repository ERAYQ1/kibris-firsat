import Link from "next/link";
import { Plus, Flame, Sparkles } from "lucide-react";

interface CommunityStatsWidgetProps {
  totalDeals: number;
}

export function CommunityStatsWidget({ totalDeals }: CommunityStatsWidgetProps) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs space-y-3.5">
      <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2.5">
        <Sparkles className="h-4 w-4 text-amber-600" />
        <span>Fırsat Keşfi</span>
      </div>

      <div className="rounded-xl bg-amber-500/10 p-3 border border-amber-500/20 space-y-1.5">
        <p className="text-xs font-bold text-amber-950">
          Kıbrıs'ta yeni bir indirim mi gördün?
        </p>
        <p className="text-[11px] text-amber-900/80 leading-relaxed">
          1 dakikada paylaş, binlerce kişinin tasarruf etmesini sağla ve topluluk puanı kazan.
        </p>
        <Link
          href="/firsat/yeni"
          className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-950 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800 active:scale-95 transition shadow-xs"
        >
          <Plus className="h-3.5 w-3.5 text-amber-400" />
          <span>Fırsat Paylaş</span>
        </Link>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
        <span className="flex items-center gap-1">
          <Flame className="h-3.5 w-3.5 text-amber-600" />
          <span>Toplam Fırsat:</span>
        </span>
        <span className="font-bold text-slate-900">{totalDeals}</span>
      </div>
    </div>
  );
}
