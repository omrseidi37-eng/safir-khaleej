
import React, { useState, useRef } from 'react';
import { Product, StoreSettings } from '../types';

interface AdminProps {
  products: Product[];
  settings: StoreSettings;
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateSettings: (settings: StoreSettings) => void;
}

const Admin: React.FC<AdminProps> = ({ products, settings, onAddProduct, onDeleteProduct, onUpdateSettings }) => {
  const [activeTab, setActiveTab] = useState<'products' | 'settings'>('products');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    discount: 0,
    category: 'إلكترونيات',
    image: '',
    supplierUrl: ''
  });

  const [formSettings, setFormSettings] = useState<StoreSettings>(settings);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;
    
    onAddProduct({
      id: Date.now().toString(),
      name: newProduct.name || '',
      description: newProduct.description || '',
      price: Number(newProduct.price) || 0,
      discount: Number(newProduct.discount) || 0,
      category: newProduct.category || 'عام',
      image: newProduct.image || '',
      supplierUrl: newProduct.supplierUrl || ''
    });

    setNewProduct({
      name: '',
      description: '',
      price: 0,
      discount: 0,
      category: 'إلكترونيات',
      image: '',
      supplierUrl: ''
    });
  };

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formSettings);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">إدارة المتجر</h2>
          <p className="text-gray-500 mt-1">تحكم في المنتجات، الخصومات، وإعدادات الربط البرمجي.</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
          <button 
            onClick={() => setActiveTab('products')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition ${activeTab === 'products' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <i className="fas fa-box ml-2"></i>
            المنتجات
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition ${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <i className="fas fa-cog ml-2"></i>
            الإعدادات
          </button>
        </div>
      </div>

      {activeTab === 'products' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Product Form */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 sticky top-24">
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <i className="fas fa-plus-circle ml-3 text-indigo-600"></i>
                إضافة منتج احترافي
              </h3>
              <form onSubmit={handleProductSubmit} className="space-y-4">
                <input 
                  placeholder="اسم المنتج (مثال: عطر العود الملكي)"
                  className="w-full border-gray-100 bg-gray-50 rounded-xl py-3 px-4 focus:ring-indigo-500" 
                  value={newProduct.name}
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                  required
                />
                
                <textarea 
                  placeholder="وصف المنتج (سيقرأه المساعد الصوتي)"
                  className="w-full border-gray-100 bg-gray-50 rounded-xl py-3 px-4 focus:ring-indigo-500" 
                  rows={4}
                  value={newProduct.description}
                  onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                ></textarea>

                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="number" 
                    placeholder="السعر الأساسي"
                    className="w-full border-gray-100 bg-gray-50 rounded-xl py-3 px-4 focus:ring-indigo-500" 
                    value={newProduct.price || ''}
                    onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})}
                    required
                  />
                  <input 
                    type="number" 
                    placeholder="نسبة الخصم %"
                    className="w-full border-gray-100 bg-gray-50 rounded-xl py-3 px-4 focus:ring-indigo-500" 
                    value={newProduct.discount || ''}
                    onChange={e => setNewProduct({...newProduct, discount: Number(e.target.value)})}
                  />
                </div>

                <select 
                  className="w-full border-gray-100 bg-gray-50 rounded-xl py-3 px-4 focus:ring-indigo-500"
                  value={newProduct.category}
                  onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                >
                  <option>إلكترونيات</option>
                  <option>عطور</option>
                  <option>بخور</option>
                  <option>إكسسوارات</option>
                </select>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500">صورة المنتج</label>
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-gray-50 border-2 border-dashed border-gray-200 text-gray-400 py-4 rounded-xl font-bold hover:bg-gray-100 hover:text-indigo-600 transition flex flex-col items-center justify-center gap-2 overflow-hidden"
                  >
                    {newProduct.image ? (
                      <img src={newProduct.image} className="h-20 object-contain" alt="Selected" />
                    ) : (
                      <>
                        <i className="fas fa-image text-2xl"></i>
                        <span>اضغط لرفع الصورة</span>
                      </>
                    )}
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>

                <input 
                  placeholder="رابط المورد (AliExpress/Dsers)"
                  className="w-full border-gray-100 bg-gray-50 rounded-xl py-3 px-4 focus:ring-indigo-500 text-xs" 
                  value={newProduct.supplierUrl}
                  onChange={e => setNewProduct({...newProduct, supplierUrl: e.target.value})}
                />

                <button 
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
                >
                  حفظ المنتج في المتجر
                </button>
              </form>
            </div>
          </div>

          {/* Product List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                 <h3 className="font-bold text-gray-900">المنتجات المعروضة ({products.length})</h3>
                 <span className="text-xs text-gray-400 italic">يتم الحفظ تلقائياً في المتصفح</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 font-bold text-gray-400 text-xs uppercase">المنتج</th>
                      <th className="px-6 py-4 font-bold text-gray-400 text-xs uppercase">السعر</th>
                      <th className="px-6 py-4 font-bold text-gray-400 text-xs uppercase">الخصم</th>
                      <th className="px-6 py-4 font-bold text-gray-400 text-xs uppercase text-left">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {products.map(product => (
                      <tr key={product.id} className="hover:bg-gray-50/50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden ml-4">
                              <img src={product.image || 'https://via.placeholder.com/100'} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div>
                              <div className="font-bold text-sm text-gray-900">{product.name}</div>
                              <div className="text-[10px] text-gray-400 truncate max-w-[150px]">{product.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900 text-sm">{product.price} ر.س</td>
                        <td className="px-6 py-4 text-sm">
                          {product.discount ? <span className="bg-red-50 text-red-500 px-2 py-1 rounded-lg font-bold">-{product.discount}%</span> : '-'}
                        </td>
                        <td className="px-6 py-4 text-left">
                          <div className="flex justify-end gap-2">
                            {product.supplierUrl && (
                               <a href={product.supplierUrl} target="_blank" rel="noreferrer" className="p-2 text-gray-400 hover:text-indigo-600">
                                 <i className="fas fa-external-link-alt"></i>
                               </a>
                            )}
                            <button 
                              onClick={() => onDeleteProduct(product.id)}
                              className="p-2 text-gray-300 hover:text-red-500 transition"
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-20 text-center text-gray-400 italic">
                           لا توجد منتجات حالياً.. ابدأ بإضافة أول منتج لمتجرك!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Settings Tab */
        <div className="max-w-3xl mx-auto">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-8 flex items-center">
              <i className="fas fa-key ml-3 text-indigo-600"></i>
              إعدادات الربط البرمجي (APIs)
            </h3>
            <form onSubmit={handleSettingsSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-600">Stripe Public Key</label>
                  <input 
                    type="password"
                    placeholder="pk_test_..."
                    className="w-full border-gray-100 bg-gray-50 rounded-xl py-3 px-4 focus:ring-indigo-500"
                    value={formSettings.stripePublicKey}
                    onChange={e => setFormSettings({...formSettings, stripePublicKey: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-600">Apple Pay Merchant ID</label>
                  <input 
                    placeholder="merchant.com.yourstore"
                    className="w-full border-gray-100 bg-gray-50 rounded-xl py-3 px-4 focus:ring-indigo-500"
                    value={formSettings.applePayMerchantId}
                    onChange={e => setFormSettings({...formSettings, applePayMerchantId: e.target.value})}
                  />
                </div>
              </div>

              <hr className="border-gray-50" />

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-600 flex items-center">
                   AliExpress / Dsers Webhook URL
                   <span className="mr-2 text-[10px] text-indigo-400 bg-indigo-50 px-2 py-0.5 rounded">اختياري</span>
                </label>
                <input 
                  placeholder="https://api.yourdropshippingapp.com/webhooks/..."
                  className="w-full border-gray-100 bg-gray-50 rounded-xl py-3 px-4 focus:ring-indigo-500"
                  value={formSettings.webhookUrl}
                  onChange={e => setFormSettings({...formSettings, webhookUrl: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-600">Dropshipping App API Key</label>
                <input 
                  type="password"
                  placeholder="App Token..."
                  className="w-full border-gray-100 bg-gray-50 rounded-xl py-3 px-4 focus:ring-indigo-500"
                  value={formSettings.supplierApiKey}
                  onChange={e => setFormSettings({...formSettings, supplierApiKey: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg"
              >
                تحديث الإعدادات والأمان
              </button>
            </form>
            
            <div className="mt-8 p-4 bg-yellow-50 rounded-2xl border border-yellow-100 flex items-start space-x-reverse space-x-3">
               <i className="fas fa-exclamation-triangle text-yellow-500 mt-1"></i>
               <p className="text-xs text-yellow-700 leading-relaxed">
                 تنبيه: يتم تشفير وحفظ هذه المفاتيح في متصفحك الحالي فقط. في البيئة الحقيقية، يجب تخزين هذه البيانات في خوادم (Backend) مؤمنة.
               </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
