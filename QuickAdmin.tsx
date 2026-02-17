
import React, { useState, useRef, useEffect } from 'react';
import { Product, StoreSettings } from '../types';
import { GULF_COUNTRIES } from '../constants';

interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  items: { name: string; supplierUrlSecret?: string }[];
  total: number;
  date: string;
  paymentMethod?: string;
  receiptImage?: string;
}

interface StoreStats {
  daily: Record<string, number>;
  sources: Record<string, number>;
}

interface QuickAdminProps {
  products: Product[];
  settings: StoreSettings;
  categories: string[];
  onUpdateSettings: (settings: StoreSettings) => void;
  onUpdateCategories: (categories: string[]) => void;
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

const QuickAdmin: React.FC<QuickAdminProps> = ({ products, settings, categories, onUpdateSettings, onUpdateCategories, onAddProduct, onUpdateProduct, onDeleteProduct }) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'settings' | 'stats' | 'categories'>('inventory');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [stats, setStats] = useState<StoreStats>({ daily: {}, sources: {} });
  const [searchStats, setSearchStats] = useState<Record<string, number>>({});
  const [liveVisitors, setLiveVisitors] = useState(0);
  const [newCatName, setNewCatName] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fix: Calculate today's visitors for the dashboard
  const todayStr = new Date().toISOString().split('T')[0];
  const totalVisitorsToday = stats.daily[todayStr] || 0;

  // Fix: Implement category deletion logic
  const handleDeleteCategory = (cat: string) => {
    if (window.confirm(`هل أنت متأكد من حذف تصنيف "${cat}"؟`)) {
      onUpdateCategories(categories.filter(c => c !== cat));
    }
  };

  // استخراج رابط المتجر النهائي
  const storeUrl = typeof window !== 'undefined' ? window.location.origin : 'https://gulf-ambassador.vercel.app';

  useEffect(() => {
    const savedOrders = localStorage.getItem('gulf_store_orders_v4');
    if (savedOrders) setOrders(JSON.parse(savedOrders));

    const savedStats = localStorage.getItem('gulf_store_stats_v1');
    if (savedStats) setStats(JSON.parse(savedStats));

    const savedSearchStats = localStorage.getItem('gulf_store_search_stats_v1');
    if (savedSearchStats) setSearchStats(JSON.parse(savedSearchStats));

    setLiveVisitors(Math.floor(Math.random() * 12) + 5);
    const interval = setInterval(() => {
      setLiveVisitors(prev => {
        const change = Math.floor(Math.random() * 3) - 1; 
        return Math.max(1, prev + change);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [activeTab]);

  const [formData, setFormData] = useState({
    name: '',
    priceUSD: '',
    image: '',
    description: '',
    category: categories[1] || 'إلكترونيات',
    supplierUrlSecret: '',
    availableCountries: GULF_COUNTRIES.map(c => c.code),
    shippingRates: Object.fromEntries(GULF_COUNTRIES.map(c => [c.code, '5']))
  });

  const [formSettings, setFormSettings] = useState<StoreSettings>(settings);

  useEffect(() => {
    setFormSettings(settings);
  }, [settings]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(storeUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, image: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      priceUSD: product.priceUSD.toString(),
      image: product.image,
      description: product.description,
      category: product.category,
      supplierUrlSecret: product.supplierUrlSecret || '',
      availableCountries: product.availableCountries || [],
      shippingRates: Object.fromEntries(Object.entries(product.shippingRates).map(([k, v]) => [k, v.toString()]))
    });
    setActiveTab('inventory');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productData: Product = {
      id: editingId || Date.now().toString(),
      name: formData.name,
      priceUSD: Number(formData.priceUSD),
      price: Number(formData.priceUSD) * 3.75,
      image: formData.image,
      description: formData.description,
      category: formData.category,
      supplierUrlSecret: formData.supplierUrlSecret,
      availableCountries: formData.availableCountries,
      shippingRates: Object.fromEntries(Object.entries(formData.shippingRates).map(([k, v]) => [k, Number(v)])),
    };

    if (editingId) onUpdateProduct(productData);
    else onAddProduct(productData);
    
    setEditingId(null);
    setFormData({ name: '', priceUSD: '', image: '', description: '', category: categories[1] || 'إلكترونيات', supplierUrlSecret: '', availableCountries: GULF_COUNTRIES.map(c => c.code), shippingRates: Object.fromEntries(GULF_COUNTRIES.map(c => [c.code, '5'])) });
  };

  const handleSettingsSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formSettings);
    alert('تم حفظ إعدادات السفير بنجاح!');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Store Link Branding - Always Visible for the Admin */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border-r-[12px] border-amber-600 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden mb-12 relative">
        <div className="absolute top-0 left-0 w-32 h-32 bg-amber-50 rounded-full -translate-x-16 -translate-y-16 opacity-50"></div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 bg-amber-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-amber-100">
            <i className="fas fa-globe text-2xl"></i>
          </div>
          <div>
            <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.3em] mb-2">رابط متجرك المباشر (Vercel)</h4>
            <p className="text-lg font-black text-gray-900 break-all select-all">{storeUrl}</p>
          </div>
        </div>
        <button 
          onClick={handleCopyLink}
          className={`px-10 py-4 rounded-2xl font-black text-sm transition-all flex items-center gap-4 whitespace-nowrap shadow-xl relative z-10 ${isCopied ? 'bg-green-600 text-white scale-95' : 'bg-gray-900 text-amber-400 hover:bg-black active:scale-95'}`}
        >
          <i className={`fas ${isCopied ? 'fa-check-circle' : 'fa-copy'}`}></i>
          {isCopied ? 'تم نسخ الرابط' : 'نسخ رابط المتجر'}
        </button>
      </div>

      <div className="flex bg-white p-1.5 rounded-[1.5rem] shadow-sm border border-gray-100 mb-12 w-fit mx-auto md:mx-0 overflow-x-auto no-scrollbar">
        <button onClick={() => setActiveTab('inventory')} className={`px-8 py-3.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${activeTab === 'inventory' ? 'bg-amber-600 text-white shadow-lg' : 'text-gray-400'}`}>المخزن</button>
        <button onClick={() => setActiveTab('categories')} className={`px-8 py-3.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${activeTab === 'categories' ? 'bg-amber-600 text-white shadow-lg' : 'text-gray-400'}`}>التصنيفات</button>
        <button onClick={() => setActiveTab('orders')} className={`px-8 py-3.5 rounded-xl text-xs font-black transition-all relative whitespace-nowrap ${activeTab === 'orders' ? 'bg-amber-600 text-white shadow-lg' : 'text-gray-400'}`}>الطلبات</button>
        <button onClick={() => setActiveTab('stats')} className={`px-8 py-3.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${activeTab === 'stats' ? 'bg-gray-900 text-amber-400' : 'text-gray-400'}`}>الإحصائيات</button>
        <button onClick={() => setActiveTab('settings')} className={`px-8 py-3.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${activeTab === 'settings' ? 'bg-amber-600 text-white shadow-lg' : 'text-gray-400'}`}>الإعدادات</button>
      </div>

      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12 animate-in fade-in duration-500">
          <div className="xl:col-span-2">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100">
              <h3 className="text-xl font-black mb-8 flex items-center gap-3"><i className="fas fa-plus-circle text-amber-600"></i> إدارة المخزن</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input placeholder="اسم المنتج" className="w-full bg-gray-50 border-none rounded-xl py-4 px-6 font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                  <input type="number" step="0.01" placeholder="السعر ($)" className="w-full bg-amber-50 border-none rounded-xl py-4 px-6 font-black text-amber-700" value={formData.priceUSD} onChange={e => setFormData({...formData, priceUSD: e.target.value})} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <select className="w-full bg-gray-50 border-none rounded-xl py-4 px-6 font-bold appearance-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required>
                    {categories.filter(c => c !== 'الكل').map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <input placeholder="رابط المورد (Secret)" className="w-full bg-gray-50 border-none rounded-xl py-4 px-6 text-sm font-medium" value={formData.supplierUrlSecret} onChange={e => setFormData({...formData, supplierUrlSecret: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full bg-gray-50 border-2 border-dashed border-gray-200 py-6 rounded-2xl font-bold text-gray-400 hover:text-amber-600 transition-all">
                    {formData.image ? <img src={formData.image} className="h-20 mx-auto rounded-lg" /> : 'اضغط لرفع صورة المنتج'}
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                </div>
                <button type="submit" className="w-full bg-amber-600 text-white py-5 rounded-2xl font-black shadow-lg">{editingId ? 'تحديث المنتج' : 'إضافة للمتجر'}</button>
              </form>
            </div>
          </div>
          <div className="space-y-6 max-h-[700px] overflow-y-auto no-scrollbar">
            {products.map(p => (
              <div key={p.id} className="bg-white p-5 rounded-[1.5rem] border border-gray-100 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <img src={p.image} className="w-14 h-14 rounded-xl object-cover" />
                  <div>
                    <p className="font-black text-xs truncate w-32">{p.name}</p>
                    <p className="text-amber-600 font-bold text-[10px]">{p.category}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(p)} className="p-2 text-gray-400 hover:text-amber-600"><i className="fas fa-edit"></i></button>
                  <button onClick={() => onDeleteProduct(p.id)} className="p-2 text-gray-400 hover:text-red-500"><i className="fas fa-trash"></i></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
          <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-gray-100">
            <div className="text-center mb-10">
               <h3 className="text-2xl font-black text-gray-900">إعدادات الهوية والأمان</h3>
               <p className="text-gray-400 text-xs font-bold mt-2 uppercase tracking-widest">تكوين الربط البرمجي لـ سفير الخليج</p>
            </div>
            
            <form onSubmit={handleSettingsSave} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase mr-2">رقم واتساب خدمة العملاء</label>
                  <input placeholder="9665xxxxxxxx" className="w-full bg-gray-50 border-none rounded-2xl py-5 px-6 font-bold mt-2 shadow-sm" value={formSettings.whatsappNumber} onChange={e => setFormSettings({...formSettings, whatsappNumber: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase mr-2">مفتاح API المورد (Dsers/AliExpress)</label>
                  <input type="password" placeholder="App Token Secret" className="w-full bg-gray-50 border-none rounded-2xl py-5 px-6 font-bold mt-2 shadow-sm" value={formSettings.supplierApiKey} onChange={e => setFormSettings({...formSettings, supplierApiKey: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-50">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase mr-2">رابط الدفع المخصص (Stripe/Paypal)</label>
                  <input placeholder="https://..." className="w-full bg-gray-50 border-none rounded-2xl py-5 px-6 font-bold mt-2 shadow-sm" value={formSettings.paymentLink} onChange={e => setFormSettings({...formSettings, paymentLink: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase mr-2">Stripe Public Key</label>
                  <input type="password" placeholder="pk_live_..." className="w-full bg-gray-50 border-none rounded-2xl py-5 px-6 font-bold mt-2 shadow-sm" value={formSettings.stripePublicKey} onChange={e => setFormSettings({...formSettings, stripePublicKey: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase mr-2">تفاصيل الحساب البنكي (للتحويل المباشر)</label>
                <textarea rows={4} className="w-full bg-gray-50 border-none rounded-2xl py-5 px-6 font-bold mt-2 shadow-sm" value={formSettings.bankAccountDetails} onChange={e => setFormSettings({...formSettings, bankAccountDetails: e.target.value})} />
              </div>

              <button type="submit" className="w-full bg-gray-900 text-white py-6 rounded-3xl font-black text-lg shadow-2xl hover:bg-black transition-all">حفظ الإعدادات بالكامل</button>
            </form>
          </div>
        </div>
      )}

      {/* باقي التبويبات (Stats, Orders, Categories) تظل كما هي لضمان عملها */}
      {activeTab === 'stats' && (
        <div className="animate-in fade-in duration-700 space-y-8">
          <div className="bg-gray-900 rounded-[2.5rem] p-8 md:p-12 border border-amber-500/20 shadow-2xl relative overflow-hidden text-white">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
              <div>
                <h3 className="text-3xl font-black mb-2">إحصائيات السفير</h3>
                <p className="text-amber-500 text-xs font-bold uppercase tracking-[0.3em]">Ambassador Hub</p>
              </div>
              <div className="flex gap-4">
                <div className="bg-gray-800/50 p-6 rounded-[2rem] text-center min-w-[140px]">
                  <div className="text-4xl font-black">{liveVisitors}</div>
                  <div className="text-[9px] font-bold text-amber-500 mt-1 uppercase">متواجد حالياً</div>
                </div>
                <div className="bg-gray-800/50 p-6 rounded-[2rem] text-center min-w-[140px]">
                  <div className="text-4xl font-black">{totalVisitorsToday}</div>
                  <div className="text-[9px] font-bold text-amber-500 mt-1 uppercase">زوار اليوم</div>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100">
              <h4 className="text-lg font-black mb-6">مصادر الزيارات</h4>
              <div className="space-y-4">
                {Object.entries(stats.sources).sort(([, a], [, b]) => (b as number) - (a as number)).map(([source, count]) => {
                  const total = (Object.values(stats.sources) as number[]).reduce((acc: number, val: number) => acc + val, 0);
                  const pct = total > 0 ? (((count as number) / total) * 100).toFixed(1) : "0.0";
                  return (
                    <div key={source} className="flex items-center gap-4">
                      <span className="w-24 text-xs font-black text-gray-700">{source}</span>
                      <div className="flex-1 bg-gray-50 h-2 rounded-full overflow-hidden"><div className="bg-amber-500 h-full" style={{ width: `${pct}%` }}></div></div>
                      <span className="text-xs font-bold text-gray-400">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100">
              <h4 className="text-lg font-black mb-6">أكثر ما يبحث عنه الناس</h4>
              <div className="space-y-3">
                {Object.entries(searchStats).sort(([, a], [, b]) => (b as number) - (a as number)).slice(0, 8).map(([term, count]) => (
                  <div key={term} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <span className="text-xs font-black text-gray-700">{term}</span>
                    <span className="bg-amber-100 text-amber-600 px-2 py-0.5 rounded-lg text-[10px] font-black">{count} بحث</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'orders' && (
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden animate-in fade-in duration-500">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center">
            <h3 className="text-xl font-black">سجل طلبات السفير ({orders.length})</h3>
            <button onClick={() => { if(confirm('مسح السجل؟')) {localStorage.removeItem('gulf_store_orders_v4'); setOrders([]);} }} className="text-red-400 hover:text-red-600 text-xs font-black">مسح السجل</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <tr><th className="px-8 py-5">العميل</th><th className="px-8 py-5">الطلب</th><th className="px-8 py-5 text-center">الإيصال</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-amber-50/20">
                    <td className="px-8 py-6">
                      <div className="font-black">{order.customerName}</div>
                      <div className="text-[10px] text-gray-400">{order.phone}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex gap-1 flex-wrap">{order.items.map((i, idx) => <span key={idx} className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded-lg text-[9px] font-bold">{i.name}</span>)}</div>
                      <div className="text-[10px] font-black mt-1">{order.total.toFixed(2)} ر.س</div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      {order.receiptImage ? <button onClick={() => setPreviewImage(order.receiptImage!)} className="bg-amber-100 text-amber-600 px-3 py-1.5 rounded-xl text-[10px] font-black">إيصال البنك</button> : <span className="text-gray-300">بطاقة</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
            <h3 className="text-xl font-black mb-6">إضافة تصنيف</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              if(!newCatName.trim()) return;
              onUpdateCategories([...categories, newCatName.trim()]);
              setNewCatName('');
            }} className="space-y-4">
              <input placeholder="اسم التصنيف" className="w-full bg-gray-50 border-none rounded-xl py-4 px-6 font-bold" value={newCatName} onChange={e => setNewCatName(e.target.value)} />
              <button type="submit" className="w-full bg-amber-600 text-white py-4 rounded-xl font-black">إضافة للقائمة</button>
            </form>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
            <h3 className="text-xl font-black mb-6">التصنيفات الحالية</h3>
            <div className="space-y-3">
              {categories.map(cat => (
                <div key={cat} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                  <span className="font-black text-sm">{cat}</span>
                  {cat !== 'الكل' && <button onClick={() => handleDeleteCategory(cat)} className="text-gray-300 hover:text-red-500"><i className="fas fa-trash-alt"></i></button>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {previewImage && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80" onClick={() => setPreviewImage(null)}>
           <img src={previewImage} className="max-w-full max-h-[80vh] rounded-3xl" />
        </div>
      )}
    </div>
  );
};

export default QuickAdmin;
