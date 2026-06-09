import Link from "next/link";
import { FiPhone, FiMail, FiMapPin, FiShield, FiGlobe, FiMessageCircle, FiShare2 } from "react-icons/fi";

interface FooterProps {
  siteSetting?: {
    siteName: string;
    logo?: string | null;
    contactPhone: string;
    contactEmail: string;
    whatsappNumber: string;
    facebookLink?: string | null;
  } | null;
}

export default function Footer({ siteSetting }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-[#0a1228] to-[#060c1a] text-slate-400 mt-auto">

      {/* Top accent line */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-[#d4a017] to-transparent opacity-60" />

      <div className="container mx-auto px-4 py-14 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand column */}
          <div className="md:col-span-1 space-y-5">
            <Link href="/" className="flex items-center gap-2 group">
              <img
                src="/logo-white.svg"
                alt="شعار ألومنيوم إكسبرت"
                className="w-9 h-9 object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <div>
                <span className="block text-white font-extrabold text-base leading-tight">{siteSetting?.siteName || "ألومنيوم إكسبرت"}</span>
                <span className="block text-[10px] text-[#d4a017] font-semibold">Aluminum Expert</span>
              </div>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
              الوجهة الرقمية الأولى في مصر لإكسسوارات الألومنيوم والألوميتال الفاخرة. نلتزم بأعلى معايير الجودة والمتانة.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#d4a017] font-semibold">
              <FiShield className="w-3.5 h-3.5" />
              <span>منتجات معتمدة ومطابقة للمواصفات</span>
            </div>
            {/* Social icons */}
            <div className="flex items-center gap-3 pt-1">
              {siteSetting?.facebookLink && (
                <a
                  href={siteSetting.facebookLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#d4a017]/10 border border-white/10 hover:border-[#d4a017]/30 flex items-center justify-center text-slate-500 hover:text-[#d4a017] transition-all"
                >
                  <FiGlobe className="w-3.5 h-3.5" />
                </a>
              )}
              <a
                href={`https://wa.me/${(siteSetting?.whatsappNumber || "+201012345678").replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#d4a017]/10 border border-white/10 hover:border-[#d4a017]/30 flex items-center justify-center text-slate-500 hover:text-[#d4a017] transition-all"
              >
                <FiMessageCircle className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-4">
            <h4 className="text-white text-sm font-extrabold relative pb-2 after:absolute after:bottom-0 after:right-0 after:w-8 after:h-0.5 after:bg-gradient-to-l after:from-[#d4a017] after:to-transparent after:rounded-full">
              روابط سريعة
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: "/", label: "الرئيسية" },
                { href: "/shop", label: "المتجر الإلكتروني" },
                { href: "/about", label: "من نحن" },
                { href: "/contact", label: "اتصل بنا" },
                { href: "/track-order", label: "تتبع طلبك" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-xs font-medium text-slate-500 hover:text-[#d4a017] transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-[#d4a017] transition-colors" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h4 className="text-white text-sm font-extrabold relative pb-2 after:absolute after:bottom-0 after:right-0 after:w-8 after:h-0.5 after:bg-gradient-to-l after:from-[#d4a017] after:to-transparent after:rounded-full">
              أقسامنا
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: "/shop?category=aluminum-handles", label: "مقابض الألومنيوم" },
                { href: "/shop?category=aluminum-hinges", label: "مفصلات الأبواب" },
                { href: "/shop?category=aluminum-locks", label: "أقفال وكوالين" },
                { href: "/shop?category=sliding-rollers", label: "عجل جرار الشبابيك" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-xs font-medium text-slate-500 hover:text-[#d4a017] transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-[#d4a017] transition-colors" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-white text-sm font-extrabold relative pb-2 after:absolute after:bottom-0 after:right-0 after:w-8 after:h-0.5 after:bg-gradient-to-l after:from-[#d4a017] after:to-transparent after:rounded-full">
              تواصل معنا
            </h4>
            <ul className="space-y-3">
              <li>
                <a href={`tel:${siteSetting?.contactPhone || "+201001234567"}`} className="flex items-start gap-3 group">
                  <div className="w-7 h-7 rounded-lg bg-white/5 group-hover:bg-[#d4a017]/10 flex items-center justify-center flex-shrink-0 border border-white/5 group-hover:border-[#d4a017]/20 transition-all mt-0.5">
                    <FiPhone className="w-3 h-3 text-[#d4a017]" />
                  </div>
                  <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-300 transition-colors" dir="ltr">{siteSetting?.contactPhone || "+20 100 123 4567"}</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${siteSetting?.contactEmail || "support@aluminum-expert.com"}`} className="flex items-start gap-3 group">
                  <div className="w-7 h-7 rounded-lg bg-white/5 group-hover:bg-[#d4a017]/10 flex items-center justify-center flex-shrink-0 border border-white/5 group-hover:border-[#d4a017]/20 transition-all mt-0.5">
                    <FiMail className="w-3 h-3 text-[#d4a017]" />
                  </div>
                  <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-300 transition-colors break-all">{siteSetting?.contactEmail || "support@aluminum-expert.com"}</span>
                </a>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/5 mt-0.5">
                  <FiMapPin className="w-3 h-3 text-[#d4a017]" />
                </div>
                <span className="text-xs font-semibold text-slate-500">القاهرة، جمهورية مصر العربية</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="container mx-auto px-4 py-5 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600 font-medium">
            © {year} {siteSetting?.siteName || "ألومنيوم إكسبرت"}. جميع الحقوق محفوظة.
          </p>
          {/* Payment methods */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider ml-1">دفع آمن:</span>
            {["ميزة", "فودافون كاش", "فيزا / ماستر", "فوري"].map((method) => (
              <span
                key={method}
                className="text-[10px] text-slate-400 font-bold bg-white/5 border border-white/8 px-2.5 py-1 rounded-lg"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
