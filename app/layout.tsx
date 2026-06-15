import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// Elegant serif with character for the topic + book titles.
const fraunces = Fraunces({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

// Clean mono for UI labels, status text, years, and the START HERE tag.
const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fathom.app"),
  title: "Fathom — five books on any subject",
  description:
    "Type any subject and get a curated five-book reading path to start with. Read five and you'll understand it better than ~99% of people.",
  openGraph: {
    title: "Fathom — five books on any subject",
    description:
      "Type any subject and get a curated five-book reading path to start with.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fathom — five books on any subject",
    description:
      "Type any subject and get a curated five-book reading path to start with.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
