import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { prisma } from "@/lib/db";
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

export async function generateMetadata(): Promise<Metadata> {
  let siteSetting = null;
  try {
    siteSetting = await prisma.siteSetting.findFirst();
  } catch (e) {
    console.error("Failed to load site setting for metadata:", e);
  }

  const title = siteSetting?.metaTitle || "ألومنيوم إكسبرت | متجر إكسسوارات الألومنيوم الفاخرة";
  const description = siteSetting?.metaDescription || "متجر ألومنيوم إكسبرت هو وجهتك الأولى للحصول على أرقى وأجود إكسسوارات الألومنيوم في مصر بجودة إيطالية ومحلية فائقة.";

  return {
    title,
    description,
    keywords:
      "إكسسوارات ألومنيوم, مقابض ألومنيوم, مفصلات أبواب, أقفال شبابيك, عجل جرار, كالون باب ألومنيوم, ألوميتال, Aluminum Expert, متجر ألومنيوم",
    authors: [{ name: siteSetting?.siteName || "ألومنيوم إكسبرت" }],
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
      title,
      description,
      siteName: siteSetting?.siteName || "ألومنيوم إكسبرت",
      images: [
        {
          url: siteSetting?.logo || "/logo.svg",
          width: 800,
          height: 800,
          alt: siteSetting?.siteName || "ألومنيوم إكسبرت",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [siteSetting?.logo || "/logo.svg"],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteSetting = await prisma.siteSetting.findFirst();

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
              <Navbar siteSetting={siteSetting} />
              <main id="main-content" className="flex-grow">
                {children}
              </main>
              <Footer siteSetting={siteSetting} />
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
