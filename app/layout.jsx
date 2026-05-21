import "./globals.css";
import { CommerceProvider } from "@/components/commerce-context";
import { SiteFrame } from "@/components/site-frame";

export const metadata = {
  metadataBase: new URL("https://bubblebud.com"),
  title: {
    default: "BubbleBud | Premium Everyday Essentials",
    template: "%s | BubbleBud",
  },
  description:
    "BubbleBud is a modern ecommerce brand for premium everyday essentials, beauty storage, gifts, tech accessories, and cozy home finds.",
  keywords: ["BubbleBud", "premium ecommerce", "beauty accessories", "lifestyle gifts", "modern essentials"],
  openGraph: {
    title: "BubbleBud | Premium Everyday Essentials",
    description: "Minimal, premium essentials designed for modern living.",
    images: ["/assets/hero-arrivals.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <CommerceProvider>
          <SiteFrame>{children}</SiteFrame>
        </CommerceProvider>
      </body>
    </html>
  );
}
