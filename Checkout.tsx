
import React, { useState, useRef } from 'react';
import { StoreSettings } from '../types';

interface CheckoutProps {
  total: number;
  settings: StoreSettings;
  onSuccess: () => void;
  cartItems?: any[];
}

const Checkout: React.FC<CheckoutProps> = ({ total, settings, onSuccess, cartItems = [] }) => {
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<'card' | 'apple' | 'bank'>('card');
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address) {
      alert("يرجى إكمال بيانات الشحن أولاً.");
      return;
    }

    if (method === 'bank' && !receiptImage) {
      alert("يرجى إرفاق صورة إيصال التحويل البنكي.");
      return;
    }
    
    setLoading(true);

    // إذا كان هناك رابط دفع مخصص، يمكننا إعادة التوجيه إليه في بيئة حقيقية
    // هنا سنقوم بمحاكاة الإرسال
    
    setTimeout(() => {
      const newOrder = {
        id: 'ORD-' + Date.now(),
        customerName: form.name,
        phone: form.phone,
        address: form.address,
        items: cartItems.map(i => ({ name: i.name, supplierUrlSecret: i.supplierUrlSecret })),
        total: total,
        date: new Date().toLocaleString('ar-SA'),
        paymentMethod: method === 'bank' ? 'تحويل بنكي' : method === 'apple' ? 'Apple Pay' : 'بطاقة ائتمان',
        receiptImage: receiptImage // حفظ الإيصال في حال التحويل البنكي
      };
      
      const existing = JSON.parse(localStorage.getItem('gulf_store_orders_v4') || '[]');
      localStorage.setItem('gulf_store_orders_v4', JSON.stringify([newOrder, ...existing]));
      
      setLoading(false);
      onSuccess();

      // في حال كان هناك رابط دفع، نوجه العميل إليه بعد تسجيل الطلب كمحاكاة
      if (settings.paymentLink && (method === 'card' || method === 'apple')) {
         console.log("Redirecting to payment gateway:", settings.paymentLink);
         // window.location.href = settings.paymentLink;
      }
    }, 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-in fade-in duration-700">
      <h2 className="text-3xl font-black mb-8 text-center text-gray-900">إتمام عملية الدفع الآمنة</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Order Summary */}
        <div className="order-2 md:order-1 space-y-8">
          <div>
            <h3 className="text-xl font-black mb-6 flex items-center">
              <i className="fas fa-shopping-bag ml-3 text-amber-600"></i>
              ملخص الطلب
            </h3>
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 mb-6">
               <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-400 font-bold">إجمالي السفير</span>
                  <span className="text-2xl font-black text-amber-600">{total.toFixed(2)} ر.س</span>
               </div>
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">جميع الأسعار تشمل الجمارك والشحن المباشر.</p>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-black mb-6 flex items-center">
              <i className="fas fa-shipping-fast ml-3 text-amber-600"></i>
              معلومات الشحن
            </h3>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="الاسم الكامل" 
                className="w-full bg-white border-none rounded-xl py-4 px-6 focus:ring-2 focus:ring-amber-600 font-bold shadow-sm" 
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                required 
              />
              <input 
                type="tel" 
                placeholder="رقم الجوال" 
                className="w-full bg-white border-none rounded-xl py-4 px-6 focus:ring-2 focus:ring-amber-600 font-bold shadow-sm text-left" 
                value={form.phone}
                onChange={e => setForm({...form, phone: e.target.value})}
                required 
              />
              <textarea 
                placeholder="العنوان بالتفصيل (المدينة، الحي، الشارع)" 
                rows={3} 
                className="w-full bg-white border-none rounded-xl py-4 px-6 focus:ring-2 focus:ring-amber-600 font-bold shadow-sm" 
                value={form.address}
                onChange={e => setForm({...form, address: e.target.value})}
                required
              ></textarea>
            </div>
          </div>
        </div>

        {/* Payment Logic */}
        <div className="order-1 md:order-2">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-50 sticky top-24">
            <h3 className="text-xl font-black mb-8 text-center text-gray-900">طريقة الدفع</h3>
            
            <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
              <button 
                onClick={() => setMethod('card')}
                className={`min-w-[100px] flex-1 py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${method === 'card' ? 'border-amber-600 bg-amber-50 text-amber-600 shadow-md' : 'border-gray-50 text-gray-400 opacity-60'}`}
              >
                <i className="fas fa-credit-card text-xl"></i>
                <span className="text-[9px] font-black uppercase">بطاقة</span>
              </button>
              <button 
                onClick={() => setMethod('apple')}
                className={`min-w-[100px] flex-1 py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${method === 'apple' ? 'border-black bg-gray-900 text-white shadow-md' : 'border-gray-50 text-gray-400 opacity-60'}`}
              >
                <i className="fab fa-apple-pay text-2xl"></i>
                <span className="text-[9px] font-black uppercase tracking-widest">Apple Pay</span>
              </button>
              <button 
                onClick={() => setMethod('bank')}
                className={`min-w-[100px] flex-1 py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${method === 'bank' ? 'border-amber-600 bg-amber-50 text-amber-600 shadow-md' : 'border-gray-50 text-gray-400 opacity-60'}`}
              >
                <i className="fas fa-university text-xl"></i>
                <span className="text-[9px] font-black uppercase">تحويل</span>
              </button>
            </div>

            <form onSubmit={handlePayment} className="space-y-6">
              {method === 'card' && (
                <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 mr-2">بيانات البطاقة (Visa / Mada)</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="0000 0000 0000 0000"
                        className="w-full bg-gray-50 border-none rounded-xl py-4 pr-12 focus:ring-2 focus:ring-amber-600 font-black tracking-widest" 
                        required 
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/0/03/Mada_Logo.svg" className="h-3 opacity-50" alt="mada" />
                        <i className="fas fa-credit-card text-gray-300"></i>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="MM/YY" className="w-full bg-gray-50 border-none rounded-xl py-4 px-6 focus:ring-2 focus:ring-amber-600 font-bold" required />
                    <input type="password" placeholder="CVC" className="w-full bg-gray-50 border-none rounded-xl py-4 px-6 focus:ring-2 focus:ring-amber-600 font-bold" required />
                  </div>
                </div>
              )}

              {method === 'apple' && (
                <div className="bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-200 text-center animate-in fade-in zoom-in duration-300">
                  <i className="fab fa-apple-pay text-6xl mb-2 text-gray-800"></i>
                  <p className="text-xs text-gray-400 font-bold">سيتم الدفع عبر المحفظة بشكل آمن</p>
                </div>
              )}

              {method === 'bank' && (
                <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                   <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                      <p className="text-[10px] font-black text-amber-700 mb-2">تفاصيل الحساب:</p>
                      <p className="text-xs font-bold text-gray-700 whitespace-pre-line leading-relaxed">
                        {/* Fix: Directly use settings.bankAccountDetails as it's a required string from the store settings */}
                        {settings.bankAccountDetails}
                      </p>
                   </div>
                   
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase mr-2">إرفاق إيصال التحويل (صورة)</label>
                      <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full bg-gray-50 border-2 border-dashed border-gray-200 py-6 rounded-2xl flex flex-col items-center gap-3 hover:bg-amber-50 hover:border-amber-200 transition-all group"
                      >
                         {receiptImage ? (
                           <div className="flex flex-col items-center gap-2">
                             <img src={receiptImage} className="h-20 w-20 object-cover rounded-xl border-2 border-white shadow-sm" alt="receipt" />
                             <span className="text-[10px] font-black text-amber-600">تم إرفاق الصورة - اضغط لتغييرها</span>
                           </div>
                         ) : (
                           <>
                             <i className="fas fa-cloud-upload-alt text-3xl text-gray-300 group-hover:text-amber-500 transition-colors"></i>
                             <span className="text-xs font-bold text-gray-400">اضغط لرفع صورة التحويل</span>
                           </>
                         )}
                      </button>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                   </div>
                </div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className={`w-full py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center space-x-reverse space-x-3 shadow-xl hover:scale-[1.02] active:scale-95 ${method === 'apple' ? 'bg-black text-white' : 'bg-amber-600 text-white'}`}
              >
                {loading ? (
                  <>
                    <i className="fas fa-circle-notch fa-spin"></i>
                    <span>جاري معالجة الطلب...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-shield-check"></i>
                    <span>{method === 'apple' ? 'تأكيد عبر Apple Pay' : method === 'bank' ? 'تأكيد إرسال الحوالة' : `دفع ${total.toFixed(2)} ر.س`}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
