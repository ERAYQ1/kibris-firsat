import type { MetadataRoute } from "next";
import { listDeals } from "@/server/deals";
import { getDb } from "@/server/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kibrisfirsat.com";

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/giris`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/kayit`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  try {
    const deals = await listDeals({ pageSize: 50 }, getDb());
    const dealUrls: MetadataRoute.Sitemap = deals.items.map((d) => ({
      url: `${baseUrl}/firsat/${d.id}`,
      lastModified: new Date(d.createdAt * 1000),
      changeFrequency: "daily",
      priority: 0.8,
    }));

    return [...staticPages, ...dealUrls];
  } catch {
    return staticPages;
  }
}
