import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kıbrıs Fırsat — Kuzey Kıbrıs İndirim & Fiyat Keşif Platformu",
    short_name: "Kıbrıs Fırsat",
    description: "Kuzey Kıbrıs'taki market, restoran, kafe ve teknoloji indirimlerini keşfedin, tasarruf edin.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0f172a",
    orientation: "portrait",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/logo.svg",
        sizes: "192x192 512x512",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
