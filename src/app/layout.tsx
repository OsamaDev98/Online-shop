import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ألومنيوم إكسبرت | متجر إكسسوارات الألومنيوم الفاخرة",
  description:
    "متجر ألومنيوم إكسبرت هو وجهتك الأولى للحصول على أرقى وأجود إكسسوارات الألومنيوم في مصر. مقابض، مفصلات، أقفال، وعجل جرار بجودة إيطالية ومحلية فائقة وأسعار منافسة.",
  keywords:
    "إكسسوارات ألومنيوم, مقابض ألومنيوم, مفصلات أبواب, أقفال شبابيك, عجل جرار, كالون باب ألومنيوم, ألوميتال, Aluminum Expert, متجر ألومنيوم",
  authors: [{ name: "ألومنيوم إكسبرت" }],
  metadataBase: new URL("https://aluminum-expert.com"),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "ar_EG",
    url: "https://aluminum-expert.com",
    title: "ألومنيوم إكسبرت | متجر إكسسوارات الألومنيوم الفاخرة",
    description: "متجر ألومنيوم إكسبرت هو وجهتك الأولى للحصول على أرقى وأجود إكسسوارات الألومنيوم في مصر بجودة إيطالية ومحلية فائقة.",
    siteName: "ألومنيوم إكسبرت",
    images: [
      {
        url: "/logo.svg",
        width: 800,
        height: 800,
        alt: "ألومنيوم إكسبرت",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ألومنيوم إكسبرت | متجر إكسسوارات الألومنيوم الفاخرة",
    description: "متجر ألومنيوم إكسبرت هو وجهتك الأولى للحصول على أرقى وأجود إكسسوارات الألومنيوم في مصر بجودة إيطالية ومحلية فائقة.",
    images: ["/logo.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-slate-900 transition-colors duration-200" style={{ backgroundColor: "#fafbff" }}>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <Navbar />
              <main id="main-content" className="flex-grow">
                {children}
              </main>
              <Footer />
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
