import type { MetadataRoute } from "next";

const siteUrl = "https://appminka.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/planes`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  ];
}
