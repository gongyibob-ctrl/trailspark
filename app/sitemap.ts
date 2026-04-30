import type { MetadataRoute } from "next";
import { TRAILS } from "@/lib/trails";

const SITE_URL = "https://trailspark.xyz";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    ...TRAILS.map((t) => ({
      url: `${SITE_URL}/trails/${t.id}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
