import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { ThemeToggle } from "@/components/ThemeToggle";

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

// Absolute base for OpenGraph/Twitter image URLs so shared links preview properly.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
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

// Set the theme before first paint (system preference, or the saved choice) so
// there's no flash of the wrong palette.
const themeScript = `(function(){try{var k='fathom-theme';var s=localStorage.getItem(k);var m=window.matchMedia('(prefers-color-scheme: light)').matches;document.documentElement.setAttribute('data-theme', s||(m?'light':'dark'));}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${fraunces.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {/* runs before paint — sets the theme so there's no flash */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}
