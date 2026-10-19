import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Farways | Honest, Clutter-Free Travel Booking",
  description:
    "An IEEE HCI research travel booking platform resolving dark patterns, hidden drip fees, and visual clutter across Stays, Flights, and Cabs.",
  keywords: [
    "ethical travel",
    "transparent pricing",
    "no dark patterns",
    "hotel booking",
    "flight booking",
    "airport cab",
    "HCI research",
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

