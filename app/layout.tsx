import type { Metadata, Viewport } from "next";
import { Great_Vibes, Playfair_Display, Quicksand } from "next/font/google";

import "./globals.css";
import { AppChrome } from "@/components/app-chrome";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ConnectedParticlesBackground } from "@/components/ui/connected-particles-background";
import {
  BRAND_CAPTION,
  BRAND_DESCRIPTION,
  BRAND_ASSET_VERSION,
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

const script = Great_Vibes({
  subsets: ["latin"],
  variable: "--font-script",
  weight: "400",
});

const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
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
    statusBarStyle: "default",
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
      { url: `/favicon.ico?v=${BRAND_ASSET_VERSION}`, sizes: "48x48" },
      {
        url: `/favicon-16x16.png?v=${BRAND_ASSET_VERSION}`,
        type: "image/png",
        sizes: "16x16",
      },
      {
        url: `/favicon-32x32.png?v=${BRAND_ASSET_VERSION}`,
        type: "image/png",
        sizes: "32x32",
      },
    ],
    apple: [
      {
        url: `/apple-icon.png?v=${BRAND_ASSET_VERSION}`,
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcut: `/favicon-32x32.png?v=${BRAND_ASSET_VERSION}`,
  },
};

export const viewport: Viewport = {
  themeColor: "#FBF9FF",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() || "";

  const app = (
    <Providers>
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
        <ConnectedParticlesBackground />
      </div>
      <div className="relative z-10">
        <AppChrome>{children}</AppChrome>
        <Toaster />
      </div>
    </Providers>
  );

  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body
        className={`${quicksand.variable} ${script.variable} ${display.variable} font-sans antialiased`}
      >
        {googleClientId ? (
          <GoogleOAuthProvider clientId={googleClientId}>{app}</GoogleOAuthProvider>
        ) : (
          app
        )}
      </body>
    </html>
  );
}
