import type { Metadata } from "next";
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
          href="https://fonts.googleapis.com/css2?family=Public+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-sky text-ink min-h-screen antialiased selection:bg-sky-deep selection:text-ink">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

