const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
const bcrypt = require("bcryptjs");

const dbUrl = process.env.DATABASE_URL || "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🗑️  تنظيف قاعدة البيانات...");
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.shippingSetting.deleteMany({});
  await prisma.homepageContent.deleteMany({});
  await prisma.siteSetting.deleteMany({});
  await prisma.adminUser.deleteMany({});
  await prisma.user.deleteMany({});

  // ─────────────────────────────────────────
  // 1. ADMIN USER
  // ─────────────────────────────────────────
  console.log("👤 إنشاء مستخدم الإدارة...");
  await prisma.adminUser.create({
    data: {
      username: "admin",
      password: await bcrypt.hash("admin123", 10),
    },
  });

  // ─────────────────────────────────────────
  // 2. CATEGORIES
  // ─────────────────────────────────────────
  console.log("📂 إنشاء التصنيفات...");
  const handles = await prisma.category.create({
    data: {
      name: "مقابض ألومنيوم",
      slug: "aluminum-handles",
      description: "مقابض متنوعة للأبواب والشبابيك الألومنيوم بأحدث التصاميم والتشطيبات.",
      orderIndex: 0,
    },
  });
  const hinges = await prisma.category.create({
    data: {
      name: "مفصلات ألومنيوم",
      slug: "aluminum-hinges",
      description: "مفصلات قوية ومقاومة للصدأ مخصصة لقطاعات الألومنيوم المختلفة.",
      orderIndex: 1,
    },
  });
  const locks = await prisma.category.create({
    data: {
      name: "أقفال وكوالين",
      slug: "aluminum-locks",
      description: "أقفال وسكاكر أمان للأبواب والشبابيك الجرارة والمفصلية.",
      orderIndex: 2,
    },
  });
  const rollers = await prisma.category.create({
    data: {
      name: "عجل جرار شبابيك",
      slug: "sliding-rollers",
      description: "عجل جرار عالي الجودة ومجاري حركة لتسهيل فتح وإغلاق النوافذ.",
      orderIndex: 3,
    },
  });
  const accessories = await prisma.category.create({
    data: {
      name: "إكسسوارات نوافذ وأبواب",
      slug: "window-accessories",
      description: "إكسسوارات متنوعة للتشطيب الاحترافي لأعمال الألومنيوم.",
      orderIndex: 4,
    },
  });

  // ─────────────────────────────────────────
  // 3. PRODUCTS (20 products)
  // ─────────────────────────────────────────
  console.log("📦 إنشاء المنتجات...");
  await prisma.product.createMany({
    data: [
      // ── HANDLES (6) ──
      {
        name: "مقبض باب ألومنيوم إيطالي فاخر - أسود مطفي",
        slug: "premium-italian-black-handle",
        description: "مقبض باب ألومنيوم مستورد بتصميم إيطالي عصري وتشطيب أسود مطفي مقاوم للخدش، مناسب لجميع قطاعات الألومنيوم السميكة وسهل التركيب.",
        price: 250.0, discountPrice: 220.0, sku: "HDL-BLK-01", brand: "Alum-Italy",
        images: "https://images.unsplash.com/photo-1509319117193-57bab727e09d?auto=format&fit=crop&q=80&w=800",
        stock: 50, color: "أسود مطفي", aluminumType: "إيطالي مستورد", dimensions: "ارتفاع 25 سم", weight: 0.45,
        isActive: true, categoryId: handles.id,
        metaTitle: "مقبض باب إيطالي فاخر أسود | ألومنيوم إكسبرت",
        metaDescription: "تسوق مقبض باب ألومنيوم إيطالي فاخر باللون الأسود المطفي المقاوم للخدش.",
      },
      {
        name: "مقبض شباك ألومنيوم عريض - فضي لامع",
        slug: "wide-silver-window-handle",
        description: "مقبض شباك ألومنيوم مريح وسهل الاستخدام، بطلاء فضي لامع ومقاوم لعوامل الرطوبة والصدأ ومناسب للشبابيك المفصلية والجرارة.",
        price: 75.0, discountPrice: 65.0, sku: "HDL-SLV-02", brand: "Alum-Local",
        images: "https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?auto=format&fit=crop&q=80&w=800",
        stock: 120, color: "فضي لامع", aluminumType: "محلي فاخر", dimensions: "ارتفاع 15 سم", weight: 0.2,
        isActive: true, categoryId: handles.id,
        metaTitle: "مقبض شباك عريض فضي | ألومنيوم إكسبرت",
        metaDescription: "مقبض شباك ألومنيوم فضي عالي الجودة ومقاوم للصدأ.",
      },
      {
        name: "مقبض باب بار ألومنيوم طويل - ذهبي",
        slug: "long-bar-gold-door-handle",
        description: "مقبض بار طويل للأبواب الزجاجية والمداخل الفاخرة بتشطيب ذهبي برونزي عالي الجودة يضفي لمسة راقية على أي تصميم.",
        price: 380.0, discountPrice: 340.0, sku: "HDL-GLD-03", brand: "Alum-Italy",
        images: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&q=80&w=800",
        stock: 30, color: "ذهبي برونزي", aluminumType: "إيطالي مستورد", dimensions: "طول 60 سم", weight: 0.9,
        isActive: true, categoryId: handles.id,
        metaTitle: "مقبض بار ذهبي طويل للمداخل الفاخرة | ألومنيوم إكسبرت",
        metaDescription: "مقبض بار ألومنيوم ذهبي فاخر للمداخل والأبواب الزجاجية.",
      },
      {
        name: "مقبض أوريبا كروم براق للشبابيك",
        slug: "chrome-oriba-window-handle",
        description: "مقبض أوريبا مصنوع من الزنك المطلي بالكروم البراق لتحمل أفضل وعمر افتراضي أطول. مثالي للشبابيك المفصلية.",
        price: 95.0, discountPrice: null, sku: "HDL-CRM-04", brand: "Oriba",
        images: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800",
        stock: 80, color: "كروم براق", aluminumType: "زنك كروم", dimensions: "ارتفاع 18 سم", weight: 0.25,
        isActive: true, categoryId: handles.id,
        metaTitle: "مقبض أوريبا كروم للشبابيك | ألومنيوم إكسبرت",
        metaDescription: "مقبض أوريبا كروم براق للشبابيك المفصلية بجودة عالية.",
      },
      {
        name: "مقبض دش ألومنيوم مقاوم للماء - أبيض",
        slug: "waterproof-white-shower-handle",
        description: "مقبض ألومنيوم مخصص للحمامات والأماكن الرطبة، مطلي بمادة مقاومة للماء والبخار ومضاد للتآكل.",
        price: 110.0, discountPrice: 90.0, sku: "HDL-WHT-05", brand: "Alum-Local",
        images: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800",
        stock: 60, color: "أبيض مطفي", aluminumType: "محلي مقاوم للماء", dimensions: "ارتفاع 20 سم", weight: 0.3,
        isActive: true, categoryId: handles.id,
        metaTitle: "مقبض دش مقاوم للماء أبيض | ألومنيوم إكسبرت",
        metaDescription: "مقبض ألومنيوم مقاوم للماء والرطوبة للحمامات.",
      },
      {
        name: "مقبض مطبخ سكيلا ألومنيوم - رمادي",
        slug: "skyla-kitchen-grey-handle",
        description: "مقبض مطبخ حديث بتصميم سكيلا الاسكندنافي، ملمس خشن مقاوم للبصمات وسهل التنظيف مناسب للمطابخ الحديثة.",
        price: 55.0, discountPrice: 45.0, sku: "HDL-GRY-06", brand: "Skyla",
        images: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=800",
        stock: 200, color: "رمادي معدني", aluminumType: "ألومنيوم آنودايز", dimensions: "طول 12 سم", weight: 0.12,
        isActive: true, categoryId: handles.id,
        metaTitle: "مقبض مطبخ سكيلا رمادي | ألومنيوم إكسبرت",
        metaDescription: "مقبض مطبخ ألومنيوم حديث مقاوم للبصمات.",
      },
      // ── HINGES (4) ──
      {
        name: "مفصلة ألومنيوم ثقيلة 3 ريشة - فضي معدني",
        slug: "three-wing-heavy-silver-hinge",
        description: "مفصلة ألومنيوم ثلاثية الريش للأبواب الثقيلة، تتحمل أوزان عالية وتضمن حركة ناعمة ومستمرة دون أصوات احتكاك.",
        price: 90.0, discountPrice: null, sku: "HNG-SLV-01", brand: "Alum-Local",
        images: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800",
        stock: 200, color: "فضي معدني", aluminumType: "6063-T5", dimensions: "100 مم", weight: 0.35,
        isActive: true, categoryId: hinges.id,
        metaTitle: "مفصلة ألومنيوم ثقيلة 3 ريشة | ألومنيوم إكسبرت",
        metaDescription: "مفصلة أبواب ألومنيوم ثقيلة ثلاثية الفصوص لحركة سلسة ومستدامة.",
      },
      {
        name: "مفصلة ألومنيوم بيانو طولية - ذهبي",
        slug: "piano-gold-hinge",
        description: "مفصلة بيانو طولية مصنوعة من الألومنيوم المقاوم للصدأ، مثالية للأبواب الطويلة والثقيلة وتوفر توزيع وزن متساوي.",
        price: 220.0, discountPrice: 195.0, sku: "HNG-GLD-02", brand: "PianoPlus",
        images: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&q=80&w=800",
        stock: 40, color: "ذهبي فاتح", aluminumType: "ألومنيوم مضغوط", dimensions: "طول 180 سم", weight: 1.2,
        isActive: true, categoryId: hinges.id,
        metaTitle: "مفصلة بيانو ذهبية طولية | ألومنيوم إكسبرت",
        metaDescription: "مفصلة بيانو ألومنيوم طولية ذهبية للأبواب الثقيلة.",
      },
      {
        name: "مفصلة مخفية للأبواب المعلقة - فضي",
        slug: "concealed-silver-concealed-hinge",
        description: "مفصلة مخفية عالية الجودة للأبواب الأوروبية والخزائن، تعطي مظهراً نظيفاً وأنيقاً مع سهولة التعديل ثلاثي الأبعاد.",
        price: 45.0, discountPrice: 38.0, sku: "HNG-CNL-03", brand: "HideMax",
        images: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=800",
        stock: 300, color: "فضي مطفي", aluminumType: "صلب مطلي", dimensions: "35 مم", weight: 0.08,
        isActive: true, categoryId: hinges.id,
        metaTitle: "مفصلة مخفية للخزائن والأبواب | ألومنيوم إكسبرت",
        metaDescription: "مفصلة مخفية عالية الجودة للأبواب الأوروبية مع ضبط ثلاثي الأبعاد.",
      },
      {
        name: "مفصلة فراشة استانلس للأبواب الخارجية",
        slug: "stainless-butterfly-hinge",
        description: "مفصلة فراشة مصنوعة من الاستانلس ستيل المقاوم للصدأ والعوامل الجوية، مثالية للأبواب الخارجية والشرفات.",
        price: 65.0, discountPrice: null, sku: "HNG-SST-04", brand: "StainPro",
        images: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800",
        stock: 150, color: "فضي كروم", aluminumType: "استانلس 304", dimensions: "75 مم", weight: 0.18,
        isActive: true, categoryId: hinges.id,
        metaTitle: "مفصلة فراشة استانلس | ألومنيوم إكسبرت",
        metaDescription: "مفصلة فراشة استانلس ستيل مقاومة للصدأ للأبواب الخارجية.",
      },
      // ── LOCKS (4) ──
      {
        name: "كالون باب ألومنيوم كمبيوتر أمان عالي - فضي",
        slug: "computer-high-security-door-lock",
        description: "قفل باب ألومنيوم متكامل بمفتاح كمبيوتر عالي الأمان وسلندر نحاسي مقاوم للاختراق والصدأ ومناسب لجميع أنواع الأبواب.",
        price: 450.0, discountPrice: 399.0, sku: "LCK-COM-01", brand: "SecurPlus",
        images: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=800",
        stock: 35, color: "كروم فضي", aluminumType: "صلب ونحاس", dimensions: "عمق 85 مم", weight: 0.8,
        isActive: true, categoryId: locks.id,
        metaTitle: "كالون كمبيوتر أمان عالي | ألومنيوم إكسبرت",
        metaDescription: "كالون باب ألومنيوم بمفاتيح كمبيوتر لحماية مطلقة للمنازل.",
      },
      {
        name: "كوالين باب ألومنيوم محوري - أسود",
        slug: "black-pivot-door-lock",
        description: "كوالين محوري لأبواب الألومنيوم الثقيلة والزجاجية، مصنوع من الزنك المطلي بالأسود المطفي ويتحمل استخداماً مكثفاً.",
        price: 180.0, discountPrice: 160.0, sku: "LCK-PVT-02", brand: "PivotMaster",
        images: "https://images.unsplash.com/photo-1580657018950-c7f7d6a6d990?auto=format&fit=crop&q=80&w=800",
        stock: 45, color: "أسود مطفي", aluminumType: "زنك مقوى", dimensions: "طول 25 سم", weight: 0.6,
        isActive: true, categoryId: locks.id,
        metaTitle: "كوالين محوري أسود للأبواب الثقيلة | ألومنيوم إكسبرت",
        metaDescription: "كوالين محوري أسود مطفي للأبواب الألومنيوم الثقيلة والزجاجية.",
      },
      {
        name: "قفل مزدوج للشبابيك الجرارة - فضي",
        slug: "double-sliding-window-lock",
        description: "قفل مزدوج للشبابيك الجرارة يؤمن الإغلاق من جهتين لأمان أكبر مع مفتاحين احتياطيين وإمكانية تركيب سهل.",
        price: 120.0, discountPrice: 105.0, sku: "LCK-DBL-03", brand: "DualLock",
        images: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800",
        stock: 70, color: "فضي معدني", aluminumType: "ألومنيوم مقوى", dimensions: "عرض 40 مم", weight: 0.25,
        isActive: true, categoryId: locks.id,
        metaTitle: "قفل مزدوج شبابيك جرارة | ألومنيوم إكسبرت",
        metaDescription: "قفل مزدوج للشبابيك الجرارة لأمان مزدوج من جهتين.",
      },
      {
        name: "سكاكر باب ألومنيوم طويل - ذهبي",
        slug: "long-gold-door-bolt",
        description: "سكاكر إغلاق طويل للأبواب الألومنيوم الكبيرة، بتشطيب ذهبي أنيق وحركة سلسة تضمن الإغلاق المحكم.",
        price: 85.0, discountPrice: null, sku: "LCK-BLT-04", brand: "Alum-Local",
        images: "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?auto=format&fit=crop&q=80&w=800",
        stock: 90, color: "ذهبي أنتيك", aluminumType: "زنك مطلي", dimensions: "طول 30 سم", weight: 0.3,
        isActive: true, categoryId: locks.id,
        metaTitle: "سكاكر باب ذهبي طويل | ألومنيوم إكسبرت",
        metaDescription: "سكاكر إغلاق ذهبي طويل للأبواب الألومنيوم بحركة سلسة.",
      },
      // ── ROLLERS (3) ──
      {
        name: "عجل جرار مزدوج ثقيل - نحاس",
        slug: "heavy-duty-double-sliding-roller",
        description: "عجل مزدوج مطلي بالنحاس والألومنيوم لضمان انزلاق سلس للنوافذ والأبواب الجرارة الكبيرة دون أي مجهود ويتحمل الأوزان الثقيلة.",
        price: 120.0, discountPrice: 110.0, sku: "ROL-DBL-01", brand: "RollerGlide",
        images: "https://images.unsplash.com/photo-1534224039826-c7a0eda0e6b3?auto=format&fit=crop&q=80&w=800",
        stock: 150, color: "ذهبي نحاسي", aluminumType: "محامل صلب نحاسي", dimensions: "قطر 22 مم", weight: 0.15,
        isActive: true, categoryId: rollers.id,
        metaTitle: "عجل جرار مزدوج ثقيل | ألومنيوم إكسبرت",
        metaDescription: "عجل جرار مزدوج عالي التحمل لانزلاق سلس.",
      },
      {
        name: "عجل شباك جرار بطاقة بيضاء - فضي",
        slug: "white-card-sliding-window-roller",
        description: "عجل شباك جرار بهيكل بلاستيكي تقوية ومحور فولاذي، مناسب للشبابيك المتوسطة الحجم ويعطي حركة هادئة.",
        price: 35.0, discountPrice: null, sku: "ROL-WHT-02", brand: "Alum-Local",
        images: "https://images.unsplash.com/photo-1609766857369-1c9f7a61d6a7?auto=format&fit=crop&q=80&w=800",
        stock: 400, color: "فضي أبيض", aluminumType: "بلاستيك مقوى + فولاذ", dimensions: "قطر 16 مم", weight: 0.05,
        isActive: true, categoryId: rollers.id,
        metaTitle: "عجل شباك جرار أبيض | ألومنيوم إكسبرت",
        metaDescription: "عجل شباك جرار خفيف للنوافذ المتوسطة.",
      },
      {
        name: "مجرى شباك جرار ألومنيوم 3 متر",
        slug: "aluminum-sliding-track-3m",
        description: "مجرى ألومنيوم للشبابيك الجرارة بطول 3 أمتار، قابل للقطع حسب المقاس وسطح أنودايز مقاوم للتآكل.",
        price: 180.0, discountPrice: 165.0, sku: "ROL-TRK-03", brand: "TrackMaster",
        images: "https://images.unsplash.com/photo-1487546331507-fcf8a5d27ab3?auto=format&fit=crop&q=80&w=800",
        stock: 60, color: "فضي طبيعي", aluminumType: "6063 آنودايز", dimensions: "طول 300 سم", weight: 1.5,
        isActive: true, categoryId: rollers.id,
        metaTitle: "مجرى شباك ألومنيوم 3 متر | ألومنيوم إكسبرت",
        metaDescription: "مجرى ألومنيوم للشبابيك الجرارة قابل للقطع.",
      },
      // ── ACCESSORIES (3) ──
      {
        name: "سدادة باب مطاطية مقاومة للرياح - شفاف",
        slug: "rubber-door-seal-wind-resistant",
        description: "سدادة مطاطية صامدة للرياح والأمطار تُركب على حواف الأبواب والشبابيك لمنع تسرب الهواء والغبار والصوت.",
        price: 25.0, discountPrice: null, sku: "ACC-SEL-01", brand: "SealPro",
        images: "https://images.unsplash.com/photo-1568992688065-536aad8a12f6?auto=format&fit=crop&q=80&w=800",
        stock: 500, color: "شفاف", aluminumType: "مطاط EPDM", dimensions: "طول 5 متر", weight: 0.25,
        isActive: true, categoryId: accessories.id,
        metaTitle: "سدادة باب مطاطية ضد الرياح | ألومنيوم إكسبرت",
        metaDescription: "سدادة مطاطية للأبواب والنوافذ تمنع تسرب الهواء والغبار.",
      },
      {
        name: "قاطع أرضي هيدروليكي للأبواب - فضي",
        slug: "hydraulic-floor-spring-silver",
        description: "قاطع أرضي هيدروليكي لإغلاق الأبواب الزجاجية والثقيلة تلقائياً بسلاسة وهدوء مع إمكانية ضبط سرعة الإغلاق.",
        price: 650.0, discountPrice: 580.0, sku: "ACC-HYD-02", brand: "FloorCloser",
        images: "https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&q=80&w=800",
        stock: 20, color: "فضي معدني", aluminumType: "صلب مقوى", dimensions: "17 × 17 سم", weight: 3.5,
        isActive: true, categoryId: accessories.id,
        metaTitle: "قاطع أرضي هيدروليكي فضي | ألومنيوم إكسبرت",
        metaDescription: "قاطع أرضي هيدروليكي لإغلاق تلقائي هادئ للأبواب الثقيلة.",
      },
      {
        name: "زاوية ربط ألومنيوم 90 درجة - طقم 4 قطع",
        slug: "aluminum-corner-bracket-90-set4",
        description: "زوايا ربط ألومنيوم قوية للتوصيل المحكم في الزوايا القائمة، مناسبة لتجميع قطاعات الألومنيوم في إطارات الأبواب والشبابيك.",
        price: 40.0, discountPrice: 35.0, sku: "ACC-CRN-03", brand: "CornerPro",
        images: "https://images.unsplash.com/photo-1581092162384-8987c1d64926?auto=format&fit=crop&q=80&w=800",
        stock: 250, color: "فضي طبيعي", aluminumType: "ألومنيوم مصبوب", dimensions: "30 × 30 مم", weight: 0.12,
        isActive: true, categoryId: accessories.id,
        metaTitle: "زاوية ربط ألومنيوم 90° طقم 4 قطع | ألومنيوم إكسبرت",
        metaDescription: "زوايا ربط ألومنيوم لتجميع الإطارات بزوايا قائمة.",
      },
    ],
  });

  // ─────────────────────────────────────────
  // 4. TEST USERS
  // ─────────────────────────────────────────
  console.log("👥 إنشاء مستخدمين تجريبيين...");
  const hashedPw = await bcrypt.hash("test123", 10);
  const user1 = await prisma.user.create({
    data: { name: "أحمد محمد علي", email: "ahmed@test.com", phone: "01012345678", password: hashedPw },
  });
  const user2 = await prisma.user.create({
    data: { name: "فاطمة حسن", email: "fatma@test.com", phone: "01198765432", password: hashedPw },
  });
  const user3 = await prisma.user.create({
    data: { name: "محمد إبراهيم", email: "mohamed@test.com", phone: "01234567890", password: hashedPw },
  });

  // ─────────────────────────────────────────
  // 5. TEST ORDERS with items
  // ─────────────────────────────────────────
  console.log("🛒 إنشاء الطلبات التجريبية...");
  // We need product IDs — fetch them
  const allProducts = await prisma.product.findMany({ take: 20 });
  const p = (slug) => allProducts.find(x => x.slug === slug);

  await prisma.order.create({
    data: {
      customerName: "أحمد محمد علي", customerEmail: "ahmed@test.com", customerPhone: "01012345678",
      shippingAddress: "شارع الجمهورية 15، الدور الثالث، القاهرة",
      province: "القاهرة", city: "القاهرة", notes: "الرجاء التواصل قبل التوصيل",
      totalAmount: 540.0, shippingFee: 50.0, discountAmount: 0.0, couponCode: null,
      status: "DELIVERED", paymentStatus: "PAID", shippingStatus: "DELIVERED",
      userId: user1.id,
      items: { create: [
        { productId: p("premium-italian-black-handle").id, quantity: 2, price: 220.0 },
        { productId: p("three-wing-heavy-silver-hinge").id, quantity: 1, price: 90.0 },
      ]},
    },
  });

  await prisma.order.create({
    data: {
      customerName: "فاطمة حسن", customerEmail: "fatma@test.com", customerPhone: "01198765432",
      shippingAddress: "شارع الهرم 88، الجيزة",
      province: "الجيزة", city: "الجيزة", notes: "",
      totalAmount: 763.0, shippingFee: 50.0, discountAmount: 76.3, couponCode: "EGY20",
      status: "SHIPPED", paymentStatus: "PAID", shippingStatus: "IN_TRANSIT",
      userId: user2.id,
      items: { create: [
        { productId: p("computer-high-security-door-lock").id, quantity: 1, price: 399.0 },
        { productId: p("wide-silver-window-handle").id, quantity: 4, price: 65.0 },
      ]},
    },
  });

  await prisma.order.create({
    data: {
      customerName: "محمد إبراهيم", customerEmail: "mohamed@test.com", customerPhone: "01234567890",
      shippingAddress: "شارع الكورنيش 200، الإسكندرية",
      province: "الإسكندرية", city: "الإسكندرية", notes: "طابق أرضي",
      totalAmount: 430.0, shippingFee: 65.0, discountAmount: 50.0, couponCode: "ALUM50",
      status: "PREPARING", paymentStatus: "PAID", shippingStatus: "PREPARING",
      userId: user3.id,
      items: { create: [
        { productId: p("heavy-duty-double-sliding-roller").id, quantity: 3, price: 110.0 },
        { productId: p("rubber-door-seal-wind-resistant").id, quantity: 2, price: 25.0 },
      ]},
    },
  });

  await prisma.order.create({
    data: {
      customerName: "خالد السيد", customerEmail: "khaled@test.com", customerPhone: "01056789012",
      shippingAddress: "مدينة نصر، حي السفارات، القاهرة",
      province: "القاهرة", city: "القاهرة", notes: null,
      totalAmount: 870.0, shippingFee: 50.0, discountAmount: 0.0, couponCode: null,
      status: "NEW", paymentStatus: "PENDING", shippingStatus: "PREPARING",
      userId: null,
      items: { create: [
        { productId: p("hydraulic-floor-spring-silver").id, quantity: 1, price: 580.0 },
        { productId: p("long-bar-gold-door-handle").id, quantity: 1, price: 340.0 },
      ]},
    },
  });

  await prisma.order.create({
    data: {
      customerName: "منى العمري", customerEmail: "mona@test.com", customerPhone: "01112345678",
      shippingAddress: "شارع التحرير 11، المنصورة",
      province: "الدقهلية", city: "المنصورة", notes: "معرض أثاث",
      totalAmount: 350.0, shippingFee: 70.0, discountAmount: 0.0, couponCode: null,
      status: "CANCELLED", paymentStatus: "REFUNDED", shippingStatus: "PREPARING",
      userId: null,
      items: { create: [
        { productId: p("piano-gold-hinge").id, quantity: 1, price: 195.0 },
        { productId: p("long-gold-door-bolt").id, quantity: 2, price: 85.0 },
      ]},
    },
  });

  // ─────────────────────────────────────────
  // 6. COUPONS
  // ─────────────────────────────────────────
  console.log("🎟️  إنشاء الكوبونات...");
  await prisma.coupon.createMany({
    data: [
      { code: "EGY20", discountType: "PERCENTAGE", discountValue: 20.0, minOrderAmount: 200.0, isActive: true },
      { code: "ALUM50", discountType: "FIXED", discountValue: 50.0, minOrderAmount: 300.0, isActive: true },
      { code: "WELCOME10", discountType: "PERCENTAGE", discountValue: 10.0, minOrderAmount: 100.0, isActive: true },
      { code: "SUMMER25", discountType: "PERCENTAGE", discountValue: 25.0, minOrderAmount: 500.0, isActive: true,
        expiryDate: new Date("2026-09-01") },
      { code: "EXPIRED15", discountType: "PERCENTAGE", discountValue: 15.0, minOrderAmount: 150.0, isActive: false,
        expiryDate: new Date("2025-01-01") },
    ],
  });

  // ─────────────────────────────────────────
  // 7. SHIPPING (all 27 Egyptian provinces)
  // ─────────────────────────────────────────
  console.log("🚚 إنشاء أسعار الشحن للمحافظات...");
  await prisma.shippingSetting.createMany({
    data: [
      { province: "القاهرة", cost: 50.0, deliveryDays: "1-2 يوم", isActive: true },
      { province: "الجيزة", cost: 50.0, deliveryDays: "1-2 يوم", isActive: true },
      { province: "القليوبية", cost: 55.0, deliveryDays: "2-3 أيام", isActive: true },
      { province: "الإسكندرية", cost: 65.0, deliveryDays: "2-3 أيام", isActive: true },
      { province: "الدقهلية", cost: 70.0, deliveryDays: "3-4 أيام", isActive: true },
      { province: "الغربية", cost: 70.0, deliveryDays: "3-4 أيام", isActive: true },
      { province: "الشرقية", cost: 70.0, deliveryDays: "3-4 أيام", isActive: true },
      { province: "المنوفية", cost: 70.0, deliveryDays: "2-3 أيام", isActive: true },
      { province: "البحيرة", cost: 75.0, deliveryDays: "3-4 أيام", isActive: true },
      { province: "كفر الشيخ", cost: 75.0, deliveryDays: "3-4 أيام", isActive: true },
      { province: "دمياط", cost: 80.0, deliveryDays: "3-4 أيام", isActive: true },
      { province: "بورسعيد", cost: 80.0, deliveryDays: "3-4 أيام", isActive: true },
      { province: "الإسماعيلية", cost: 75.0, deliveryDays: "2-3 أيام", isActive: true },
      { province: "السويس", cost: 75.0, deliveryDays: "2-3 أيام", isActive: true },
      { province: "الفيوم", cost: 85.0, deliveryDays: "3-4 أيام", isActive: true },
      { province: "بني سويف", cost: 85.0, deliveryDays: "3-4 أيام", isActive: true },
      { province: "المنيا", cost: 90.0, deliveryDays: "4-5 أيام", isActive: true },
      { province: "أسيوط", cost: 95.0, deliveryDays: "4-5 أيام", isActive: true },
      { province: "سوهاج", cost: 100.0, deliveryDays: "4-5 أيام", isActive: true },
      { province: "قنا", cost: 110.0, deliveryDays: "5-6 أيام", isActive: true },
      { province: "الأقصر", cost: 120.0, deliveryDays: "5-6 أيام", isActive: true },
      { province: "أسوان", cost: 130.0, deliveryDays: "5-7 أيام", isActive: true },
      { province: "مطروح", cost: 110.0, deliveryDays: "5-7 أيام", isActive: true },
      { province: "شمال سيناء", cost: 100.0, deliveryDays: "4-6 أيام", isActive: true },
      { province: "جنوب سيناء", cost: 120.0, deliveryDays: "5-7 أيام", isActive: true },
      { province: "الوادي الجديد", cost: 130.0, deliveryDays: "6-8 أيام", isActive: true },
      { province: "البحر الأحمر", cost: 110.0, deliveryDays: "5-7 أيام", isActive: true },
    ],
  });

  // ─────────────────────────────────────────
  // 8. HOMEPAGE CONTENT
  // ─────────────────────────────────────────
  console.log("🏠 إنشاء محتوى الصفحة الرئيسية...");
  await prisma.homepageContent.create({
    data: {
      heroTitle: "ألومنيوم إكسبرت — الوجهة الأولى لإكسسوارات الألومنيوم في مصر",
      heroSubtitle: "مقابض، أقفال، مفصلات وعجل جرار بجودة فائقة لجميع أبواب وشبابيك الألومنيوم — توصيل سريع لكافة المحافظات في 24-48 ساعة.",
      heroImage: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=1600",
      ctaText: "تصفح المعرض الآن",
      ctaLink: "/shop",
    },
  });

  // ─────────────────────────────────────────
  // 9. SITE SETTINGS
  // ─────────────────────────────────────────
  console.log("⚙️  إنشاء إعدادات الموقع...");
  await prisma.siteSetting.create({
    data: {
      siteName: "ألومنيوم إكسبرت",
      logo: "",
      contactPhone: "+201012345678",
      contactEmail: "support@aluminum-expert.com",
      whatsappNumber: "+201012345678",
      facebookLink: "https://facebook.com/aluminum.expert",
      metaTitle: "ألومنيوم إكسبرت | متجر إكسسوارات الألومنيوم الأول في مصر",
      metaDescription: "تسوق أفضل إكسسوارات الأبواب والشبابيك الألومنيوم. مقابض، أقفال، مفصلات وعجل جرار بجودة عالية مع توصيل سريع لكافة محافظات مصر.",
    },
  });

  console.log("✅ تمت تغذية قاعدة البيانات بالكامل بنجاح!");
  console.log("   👤 Admin: username=admin  password=admin123");
  console.log("   👥 Users: ahmed@test.com / fatma@test.com / mohamed@test.com  (password: test123)");
  console.log("   🎟️  Coupons: EGY20, ALUM50, WELCOME10, SUMMER25");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
