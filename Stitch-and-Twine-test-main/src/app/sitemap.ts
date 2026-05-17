import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const SITE_URL = "https://www.stitchandtwinecrochet.com";

type ProductSlugRow = {
  slug: string | null;
  updated_at: string | null;
};

async function getActiveProductEntries(): Promise<MetadataRoute.Sitemap> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Keep sitemap available even if Supabase env vars are missing.
  if (!supabaseUrl || !supabaseAnonKey) {
    return [];
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data, error } = await supabase
      .from("products")
      .select("slug, updated_at")
      .eq("is_active", true)
      .not("slug", "is", null);

    if (error || !data) {
      return [];
    }

    return (data as ProductSlugRow[])
      .filter((row) => typeof row.slug === "string" && row.slug.length > 0)
      .map((row) => ({
        url: `${SITE_URL}/product/${row.slug}`,
        lastModified: row.updated_at ? new Date(row.updated_at) : new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/shop`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/custom-order`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
  ];

  const productRoutes = await getActiveProductEntries();
  return [...staticRoutes, ...productRoutes];
}
