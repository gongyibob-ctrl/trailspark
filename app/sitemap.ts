import type { MetadataRoute } from "next";
import { TRAILS } from "@/lib/trails";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/trails`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...TRAILS.map((t) => ({
      url: `${SITE_URL}/trails/${t.id}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
