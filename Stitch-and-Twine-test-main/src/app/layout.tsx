import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { OrderProvider } from "@/context/OrderContext";
import { AuthProvider } from "@/context/AuthContext";
import { SalesProvider } from "@/context/SalesContext";
import { ThemeProvider } from "@/context/ThemeContext";
import ClientLayout from "@/components/layout/ClientLayout";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Stitch and Twine — Handmade Crochet Boutique",
  description: "Discover handcrafted crochet gifts made with love. Flowers, bouquets, keycharms, bags, gajry and more — each piece a labor of love.",
  keywords: ["crochet", "handmade", "boutique", "gifts", "flowers", "bouquets", "keycharms"],
  verification: {
    google: "L3kxguoP9fOXAU5Yz5VDokXGg2NeXScgW-2RQAJxNJ0",
  },
  openGraph: {
    title: "Stitch and Twine",
    description: "Handmade Crochet Boutique",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} overflow-x-hidden min-h-dvh`} suppressHydrationWarning>
      <body className="overflow-x-hidden min-h-dvh">
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <SalesProvider>
                  <OrderProvider>
                    <ClientLayout>{children}</ClientLayout>
                    <Analytics />
                  </OrderProvider>
                </SalesProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

