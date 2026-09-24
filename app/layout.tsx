import type { Metadata, Viewport } from "next";
import { Quicksand } from "next/font/google";

import "./globals.css";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ConnectedParticlesBackground } from "@/components/ui/connected-particles-background";
import {
  BRAND_CAPTION,
  BRAND_DESCRIPTION,
  BRAND_ICON_SRC,
  BRAND_LOGO_SRC,
  BRAND_NAME,
  BRAND_TITLE,
} from "@/lib/branding";

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  title: {
    default: BRAND_TITLE,
    template: `%s | ${BRAND_NAME}`,
  },
  description: BRAND_DESCRIPTION,
  applicationName: BRAND_NAME,
  manifest: "/manifest.json",
  appleWebApp: {
    title: BRAND_NAME,
    capable: true,
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    type: "website",
    siteName: BRAND_NAME,
    title: BRAND_TITLE,
    description: BRAND_CAPTION,
    images: [
      {
        url: BRAND_LOGO_SRC,
        width: 1024,
        height: 1024,
        alt: `${BRAND_NAME} — ${BRAND_CAPTION}`,
      },
    ],
  },
  twitter: {
    card: "summary",
    title: BRAND_TITLE,
    description: BRAND_CAPTION,
    images: [BRAND_LOGO_SRC],
  },
  icons: {
    icon: [
      { url: "/favicon.ico?v=3", sizes: "any" },
      { url: "/icon.png?v=3", type: "image/png", sizes: "512x512" },
      { url: `${BRAND_ICON_SRC}?v=3`, type: "image/png", sizes: "900x900" },
    ],
    apple: [{ url: "/apple-icon.png?v=3", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico?v=3",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0614",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() || "";

  const app = (
    <Providers>
      <div className="space-bg" aria-hidden>
        <div className="space-stars" />
        <ConnectedParticlesBackground />
      </div>
      <div className="relative z-10">
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <Toaster />
      </div>
    </Providers>
  );

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${quicksand.variable} font-sans antialiased`}>
        {googleClientId ? (
          <GoogleOAuthProvider clientId={googleClientId}>{app}</GoogleOAuthProvider>
        ) : (
          app
        )}
      </body>
    </html>
  );
}
