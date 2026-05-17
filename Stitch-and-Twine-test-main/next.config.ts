import type { NextConfig } from "next";

const supabaseHostname = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;

  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
})();

const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  { protocol: "https", hostname: "images.unsplash.com" },
  { protocol: "https", hostname: "cdn.jsdelivr.net" },
  { protocol: "https", hostname: "cdn1.iconfinder.com" },
  { protocol: "https", hostname: "**.supabase.co" },
];

if (supabaseHostname) {
  remotePatterns.push({ protocol: "https", hostname: supabaseHostname });
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
    // Supabase storage can be slow on cold reads; bypass optimizer fetch timeouts.
    unoptimized: true,
  },
};

export default nextConfig;
