import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { OrderProvider } from "@/context/OrderContext";
import ClientLayout from "@/components/layout/ClientLayout";

export const metadata: Metadata = {
  title: "Stitch and Twine — Handmade Crochet Boutique",
  description: "Discover handcrafted crochet gifts made with love. Flowers, bouquets, keycharms, bags, gajry and more — each piece a labor of love.",
  keywords: ["crochet", "handmade", "boutique", "gifts", "flowers", "bouquets", "keycharms"],
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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <CartProvider>
          <WishlistProvider>
            <OrderProvider>
              <ClientLayout>{children}</ClientLayout>
            </OrderProvider>
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
