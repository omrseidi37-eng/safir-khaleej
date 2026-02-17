
import React, { useState, useEffect, useCallback } from 'react';
import { View, Product, CartItem, StoreSettings, CountryConfig } from './types';
import { INITIAL_PRODUCTS, CATEGORIES as INITIAL_CATEGORIES, GULF_COUNTRIES } from './constants';
import Header from './components/Header';
import ProductCard from './components/ProductCard';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import QuickAdmin from './components/QuickAdmin';
import WelcomePopup from './components/WelcomePopup';
import AdminLogin from './components/AdminLogin';
import PoliciesModal from './components/PoliciesModal';

const LS_PRODUCTS_KEY = 'gulf_store_products_global_v4';
const LS_SETTINGS_KEY = 'gulf_store_settings_v4';
const LS_COUNTRY_KEY = 'gulf_user_country_v4';
const LS_AUTH_KEY = 'gulf_admin_auth_v4';
const LS_STATS_KEY = 'gulf_store_stats_v1';
const LS_CATEGORIES_KEY = 'gulf_store_categories_v2';
const LS_SEARCH_STATS_KEY = 'gulf_store_search_stats_v1';

const DEFAULT_SETTINGS: StoreSettings = {
  stripePublicKey: '',
  applePayMerchantId: '',
  supplierApiKey: '',
  webhookUrl: '',
  whatsappNumber: '966500000000',
  paymentLink: '',
  bankAccountDetails: 'الرجاء التحويل إلى حساب الراجحي: SA12345678901234567890\nباسم: مؤسسة سفير الخليج التجارية'
};

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [isAdminMode, setIsAdminMode] = useState(() => {
    return localStorage.getItem(LS_AUTH_KEY) === 'true';
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showPolicies, setShowPolicies] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  
  const [userCountry, setUserCountry] = useState<CountryConfig>(() => {
    const saved = localStorage.getItem(LS_COUNTRY_KEY);
    return saved ? JSON.parse(saved) : GULF_COUNTRIES[0];
  });
  
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(LS_PRODUCTS_KEY);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem(LS_SETTINGS_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem(LS_CATEGORIES_KEY);
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  // منطق تتبع الزوار والمصادر
  useEffect(() => {
    const trackVisitor = () => {
      const today = new Date().toISOString().split('T')[0];
      const stats = JSON.parse(localStorage.getItem(LS_STATS_KEY) || '{"daily":{}, "sources":{}}');
      
      stats.daily[today] = (stats.daily[today] || 0) + 1;
      
      const ref = document.referrer.toLowerCase();
      let source = 'رابط مباشر';
      if (ref.includes('tiktok')) source = 'TikTok';
      else if (ref.includes('instagram')) source = 'Instagram';
      else if (ref.includes('snapchat')) source = 'Snapchat';
      else if (ref.includes('google')) source = 'Google';
      else if (ref.includes('facebook')) source = 'Facebook';
      
      stats.sources[source] = (stats.sources[source] || 0) + 1;
      
      localStorage.setItem(LS_STATS_KEY, JSON.stringify(stats));
    };

    trackVisitor();
  }, []);

  // تتبع الكلمات الأكثر بحثاً
  useEffect(() => {
    if (searchQuery.length < 3) return;

    const timer = setTimeout(() => {
      const stats = JSON.parse(localStorage.getItem(LS_SEARCH_STATS_KEY) || '{}');
      const term = searchQuery.toLowerCase().trim();
      stats[term] = (stats[term] || 0) + 1;
      localStorage.setItem(LS_SEARCH_STATS_KEY, JSON.stringify(stats));
    }, 2000); // تسجيل الكلمة بعد ثانيتين من التوقف عن الكتابة

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    localStorage.setItem(LS_PRODUCTS_KEY, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(LS_SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(LS_COUNTRY_KEY, JSON.stringify(userCountry));
  }, [userCountry]);

  useEffect(() => {
    localStorage.setItem(LS_CATEGORIES_KEY, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      }
    };
    checkKey();

    const seen = localStorage.getItem('gulf_welcome_seen_v4');
    if (!seen) {
      const timer = setTimeout(() => setShowWelcome(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
      showNotification('تم تحديث مفتاح الوصول بنجاح');
    }
  };

  const handleLoginSuccess = () => {
    setIsAdminMode(true);
    localStorage.setItem(LS_AUTH_KEY, 'true');
    setShowLoginModal(false);
    showNotification('مرحباً بك يا عمر في لوحة سفير الخليج');
  };

  const handleLogout = () => {
    setIsAdminMode(false);
    localStorage.removeItem(LS_AUTH_KEY);
    setView('home');
    showNotification('تم تسجيل الخروج بأمان');
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    showNotification(`تمت إضافة ${product.name} للسلة`);
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredProducts = products.filter(p => {
    const matchesCountry = (p.availableCountries || []).includes(userCountry.code);
    const matchesCategory = activeCategory === 'الكل' || p.category === activeCategory;
    
    // فلترة البحث الذكي
    const query = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      p.name.toLowerCase().includes(query) || 
      p.description.toLowerCase().includes(query) || 
      p.category.toLowerCase().includes(query);

    return matchesCountry && matchesCategory && matchesSearch;
  });

  const cartTotal = (cart.reduce((sum, item) => sum + (item.priceUSD * item.quantity), 0) + 
                    cart.reduce((sum, item) => sum + ((item.shippingRates?.[userCountry.code] || 0) * item.quantity), 0)) * userCountry.rateToUSD;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 selection:bg-amber-100" dir="rtl">
      <Header 
        currentView={view} 
        setView={setView} 
        cartCount={cart.reduce((sum, i) => sum + i.quantity, 0)} 
        onLogoLongPress={() => setShowLoginModal(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <div className="bg-gray-900 text-white py-2 px-4 border-b border-gray-800 sticky top-20 z-40 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-[10px] md:text-[11px] font-black tracking-wider uppercase">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            توصيل مباشر إلى {userCountry.name}
          </div>
          <select 
            className="bg-transparent border-none p-0 focus:ring-0 cursor-pointer text-amber-400 hover:text-white transition-colors font-bold"
            value={userCountry.code}
            onChange={(e) => {
              const country = GULF_COUNTRIES.find(c => c.code === e.target.value);
              if (country) setUserCountry(country);
            }}
          >
            {GULF_COUNTRIES.map(c => <option key={c.code} value={c.code} className="text-black">{c.name}</option>)}
          </select>
        </div>
      </div>

      <main className="flex-grow">
        {view === 'home' && (
          <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
            <div className="relative rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-gray-900 h-64 md:h-96 mb-12 shadow-2xl group">
              <img 
                src="https://images.unsplash.com/photo-1541339907198-e08759df9a73?auto=format&fit=crop&q=80&w=1200" 
                alt="Hero" 
                className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-[2000ms]" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/40 to-transparent"></div>
              <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6">
                <span className="text-amber-400 text-[10px] font-black tracking-[0.3em] uppercase mb-4">فخامة الاختيار .. رقي السفير</span>
                <h1 className="text-3xl md:text-5xl font-black text-white mb-4">سفير الخليج للمنتجات العالمية</h1>
                <p className="text-sm md:text-lg text-gray-200 font-medium max-w-xl">ننتقي لك أفضل ما أنتجه العالم، ونوصله إليك بعناية تامة وبأسعار منافسة.</p>
              </div>
            </div>

            <div className="flex overflow-x-auto gap-3 mb-10 pb-4 no-scrollbar justify-start md:justify-center">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setSearchQuery(''); }}
                  className={`px-6 md:px-10 py-3 rounded-2xl font-black text-xs transition-all border-2 whitespace-nowrap ${
                    activeCategory === cat && !searchQuery ? 'bg-amber-600 border-amber-600 text-white shadow-xl' : 'bg-white border-gray-100 text-gray-400 hover:border-amber-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {searchQuery && (
              <div className="mb-8 flex items-center justify-between">
                <p className="text-gray-900 font-black">نتائج البحث عن: <span className="text-amber-600">"{searchQuery}"</span></p>
                <button onClick={() => setSearchQuery('')} className="text-[10px] font-black text-gray-400 hover:text-red-500 underline uppercase tracking-widest">مسح البحث</button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
              {filteredProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAddToCart={addToCart} 
                  localCurrency={userCountry}
                  onKeyError={handleSelectKey}
                />
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-full py-20 text-center">
                  <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                    <i className="fas fa-search text-3xl"></i>
                  </div>
                  <h3 className="text-xl font-black text-gray-900">عذراً، لم نجد نتائج مطابقة</h3>
                  <p className="text-gray-400 text-sm mt-2">جرب البحث بكلمات أخرى أو تصفح التصنيفات المتاحة.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'cart' && (
          <Cart 
            items={cart} 
            userCountry={userCountry} 
            onRemove={(id) => setCart(c => c.filter(item => item.id !== id))} 
            onUpdateQuantity={(id, d) => setCart(c => c.map(i => i.id === id ? {...i, quantity: Math.max(1, i.quantity + d)} : i))} 
            onCheckout={() => setView('checkout')} 
          />
        )}
        
        {view === 'checkout' && (
          <Checkout 
            total={cartTotal} 
            settings={settings} 
            cartItems={cart} 
            onSuccess={() => {setCart([]); setView('home'); showNotification('شكراً لثقتكم بسفير الخليج!');}} 
          />
        )}

        {isAdminMode && (
          <div className="bg-gray-50 border-t-8 border-amber-600 animate-in slide-in-from-bottom-10 duration-700">
            <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                   <i className="fas fa-user-shield text-xl"></i>
                </div>
                <div>
                  <h2 className="font-black text-gray-900">إدارة سفير الخليج</h2>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">مدير المتجر: عمر عمر</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={handleSelectKey}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${!hasApiKey ? 'bg-red-600 text-white animate-pulse' : 'bg-green-600 text-white'}`}
                >
                   <i className="fas fa-key ml-2"></i>
                   {hasApiKey ? 'مفتاح المساعد مفعل' : 'تفعيل المساعد (منصور)'}
                </button>
                <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-8 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-red-100 transition-all">خروج آمن</button>
              </div>
            </div>
            <QuickAdmin 
              products={products} 
              settings={settings}
              categories={categories}
              onUpdateSettings={setSettings}
              onUpdateCategories={setCategories}
              onAddProduct={(p) => setProducts([p, ...products])} 
              onUpdateProduct={(up) => setProducts(products.map(p => p.id === up.id ? up : p))} 
              onDeleteProduct={(id) => setProducts(products.filter(p => p.id !== id))} 
            />
          </div>
        )}
      </main>

      <footer className="bg-white border-t pt-20 pb-10 text-center relative mt-12 overflow-hidden shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16 text-right md:text-center">
            <div className="space-y-6">
              <div className="bg-amber-50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 text-amber-600 shadow-sm border border-amber-100">
                 <i className="fas fa-crown text-2xl"></i>
              </div>
              <p className="text-gray-900 font-black text-sm uppercase tracking-[0.3em]">Gulf Ambassador Hub</p>
              <p className="text-gray-400 text-xs max-w-sm mx-auto leading-relaxed font-medium">نحن سفيركم التجاري الموثوق الذي يجوب العالم ليأتيكم بأرقى المنتجات بجودة عالمية وشحن مباشر لبيوتكم.</p>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-black text-gray-900">سياسات المتجر</h3>
              <ul className="space-y-4">
                <li>
                  <button 
                    onClick={() => setShowPolicies(true)}
                    className="text-gray-500 hover:text-amber-600 font-black text-xs transition-colors flex items-center justify-center gap-2 mx-auto"
                  >
                    <i className="fas fa-file-contract text-amber-500/50"></i>
                    سياسة الاسترجاع والضمان
                  </button>
                </li>
                <li>
                   <a href="#" className="text-gray-400 hover:text-amber-600 font-black text-[11px] transition-colors">الشحن والتوصيل</a>
                </li>
                <li>
                   <a href="#" className="text-gray-400 hover:text-amber-600 font-black text-[11px] transition-colors">الأسئلة الشائعة</a>
                </li>
              </ul>
            </div>

            <div className="space-y-6">
               <h3 className="text-lg font-black text-gray-900">تواصل معنا</h3>
               <div className="flex justify-center gap-6 text-gray-400">
                  <a href="#" className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center hover:bg-amber-600 hover:text-white transition-all shadow-sm">
                    <i className="fab fa-instagram"></i>
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center hover:bg-amber-600 hover:text-white transition-all shadow-sm">
                    <i className="fab fa-tiktok"></i>
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center hover:bg-amber-600 hover:text-white transition-all shadow-sm">
                    <i className="fab fa-snapchat"></i>
                  </a>
               </div>
               <p className="text-gray-400 text-[11px] font-bold">للدعم الفني: support@gulfambassador.com</p>
            </div>
          </div>

          <div className="pt-10 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
             <p className="text-gray-300 text-[10px] font-bold">جميع الحقوق محفوظة © {new Date().getFullYear()} - متجر سفير الخليج الرسمي</p>
             <div className="flex gap-4 opacity-50 grayscale hover:grayscale-0 transition-all scale-90">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" alt="visa" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-6" alt="mastercard" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/0/03/Mada_Logo.svg" className="h-4" alt="mada" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-4" alt="paypal" />
             </div>
          </div>
        </div>
        
        <div 
          onClick={() => setShowLoginModal(true)} 
          className="absolute bottom-1 right-1 w-2 h-2 bg-transparent cursor-default opacity-0"
        ></div>
      </footer>

      <a 
        href={`https://wa.me/${settings.whatsappNumber || '966500000000'}`} 
        target="_blank" 
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-[100] w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all group border-4 border-white"
      >
        <i className="fab fa-whatsapp text-3xl"></i>
        <span className="absolute right-full mr-3 bg-white text-gray-900 px-4 py-2 rounded-xl text-[10px] font-black shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-100">
           تحدث مع خدمة عملاء السفير
        </span>
      </a>

      <WelcomePopup show={showWelcome} onClose={() => {setShowWelcome(false); localStorage.setItem('gulf_welcome_seen_v4', 'true');}} />
      <PoliciesModal show={showPolicies} onClose={() => setShowPolicies(false)} />
      
      {showLoginModal && (
        <AdminLogin 
          onSuccess={handleLoginSuccess} 
          onClose={() => setShowLoginModal(false)} 
        />
      )}

      {notification && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[110] bg-gray-900/95 backdrop-blur-xl text-white px-8 py-4 rounded-full shadow-2xl animate-slide-up border border-white/10 text-xs font-black">
          {notification}
        </div>
      )}

      <style>{`
        @keyframes slide-up { from { transform: translate(-50%, 50px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default App;
