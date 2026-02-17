
import { Product, CountryConfig } from './types';

export const GULF_COUNTRIES: CountryConfig[] = [
  { code: 'SA', name: 'المملكة العربية السعودية', currency: 'SAR', symbol: 'ر.س', rateToUSD: 3.75 },
  { code: 'AE', name: 'الإمارات العربية المتحدة', currency: 'AED', symbol: 'د.إ', rateToUSD: 3.67 },
  { code: 'KW', name: 'الكويت', currency: 'KWD', symbol: 'د.ك', rateToUSD: 0.31 },
  { code: 'QA', name: 'قطر', currency: 'QAR', symbol: 'ر.ق', rateToUSD: 3.64 },
  { code: 'BH', name: 'البحرين', currency: 'BHD', symbol: 'د.ب', rateToUSD: 0.38 },
  { code: 'OM', name: 'عمان', currency: 'OMR', symbol: 'ر.ع', rateToUSD: 0.38 }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'ساعة ذكية ألترا - إصدار الخليج',
    description: 'ساعة ذكية متطورة تدعم اللغة العربية بالكامل، مع تتبع دقيق للصحة والرياضة وبطارية تدوم طويلاً.',
    price: 299,
    priceUSD: 80,
    category: 'إلكترونيات',
    image: 'https://images.unsplash.com/photo-1544117518-30df578096a4?auto=format&fit=crop&q=80&w=400',
    availableCountries: ['SA', 'AE', 'KW', 'QA', 'BH', 'OM'],
    shippingRates: { 'SA': 5, 'AE': 7, 'KW': 10, 'QA': 8, 'BH': 8, 'OM': 10 },
    reviews: [
      { id: 'r1', userName: 'أبو فهد', rating: 5, comment: 'الساعة جبارة ووصلتني في 6 أيام للرياض، الخامة فخمة والربط مع الجوال سهل.', date: 'قبل يومين', location: 'الرياض', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=150' },
      { id: 'r2', userName: 'سلمان الدوسري', rating: 5, comment: 'ممتازة جداً ووزنها خفيف على اليد، التغليف يبيض الوجه.', date: 'قبل أسبوع', location: 'الدمام' },
      { id: 'r3', userName: 'خالد العنزي', rating: 4, comment: 'جودة طيبة وسعر مناسب، أنصح فيها للي يبي شي عملي وفخم.', date: 'قبل أسبوعين', location: 'جدة' }
    ]
  },
  {
    id: '2',
    name: 'عطر العود الملكي',
    description: 'مزيج فاخر من العود الكمبودي والمسك الأبيض، رائحة ثابتة وفواحة تعكس الأصالة الخليجية.',
    price: 450,
    priceUSD: 120,
    category: 'عطور',
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=400',
    availableCountries: ['SA', 'AE', 'QA', 'BH', 'OM', 'KW'],
    shippingRates: { 'SA': 0, 'AE': 5, 'QA': 8, 'BH': 8, 'OM': 10, 'KW': 10 },
    reviews: [
      { id: 'r4', userName: 'بنت الرياض', rating: 5, comment: 'الريحة خيال وثابتة يومين، شكراً سفير الخليج على المصداقية.', date: 'قبل ٣ أيام', location: 'الرياض', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=150' },
      { id: 'r5', userName: 'محمد الشمري', rating: 5, comment: 'وصلني في وقت قياسي والتغليف فخم جداً ينفع هدايا.', date: 'قبل ٩ أيام', location: 'حائل' },
      { id: 'r6', userName: 'فهد المطيري', rating: 5, comment: 'عود أصلي وريحته تملأ البيت، الخامة ممتازة ووصلني في 8 أيام.', date: 'قبل شهر', location: 'القصيم' }
    ]
  }
];

export const CATEGORIES = ['الكل', 'إلكترونيات', 'عطور', 'بخور'];
