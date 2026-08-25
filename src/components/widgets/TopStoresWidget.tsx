import Link from "next/link";
import { Store, ChevronRight, CheckCircle2 } from "lucide-react";

interface StoreItem {
  id: number;
  name: string;
  locationName: string;
  isVerified: boolean;
  dealsCount?: number;
}

interface TopStoresWidgetProps {
  stores: StoreItem[];
}

export function TopStoresWidget({ stores }: TopStoresWidgetProps) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs space-y-3.5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-900">
          <Store className="h-4 w-4 text-amber-600" />
          <span>Popüler İşletmeler</span>
        </div>
      </div>

      <div className="space-y-2">
        {stores.slice(0, 5).map((store) => (
          <Link
            key={store.id}
            href={`/magaza/${store.id}`}
            className="flex items-center justify-between rounded-xl p-2 transition hover:bg-slate-50 group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-white font-black text-xs">
                {store.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1 text-xs font-bold text-slate-900 group-hover:text-amber-800 transition truncate">
                  <span className="truncate">{store.name}</span>
                  {store.isVerified && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 truncate">{store.locationName}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0 text-slate-400 group-hover:text-slate-700">
              {store.dealsCount !== undefined && store.dealsCount > 0 && (
                <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                  {store.dealsCount}
                </span>
              )}
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
