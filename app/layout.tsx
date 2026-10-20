import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Farways | Transparent Travel Booking · Stays, Flights, Trains & Cabs",
  description:
    "Book hotels, flights, trains, and cabs across India with zero hidden fees, zero drip pricing, and 100% transparent all-inclusive fares.",
  keywords: [
    "transparent travel booking",
    "zero hidden fees",
    "hotels in india",
    "cheap flights",
    "indian railways",
    "airport cab transfers",
    "honest pricing",
    "farways travel",
  ],
  icons: {
    icon: [
      { url: "/fav-all/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/fav-all/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/fav-all/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/fav-all/apple-icon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/fav-all/manifest.json",
  other: {
    "msapplication-TileColor": "#ffffff",
    "msapplication-TileImage": "/fav-all/ms-icon-144x144.png",
    "msapplication-config": "/fav-all/browserconfig.xml",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
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
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-sky text-ink min-h-screen selection:bg-sky-deep selection:text-ink">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
