
import React from 'react';
import { CartItem, CountryConfig } from '../types';

interface CartProps {
  items: CartItem[];
  userCountry: CountryConfig;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onCheckout: () => void;
}

const Cart: React.FC<CartProps> = ({ items, userCountry, onRemove, onUpdateQuantity, onCheckout }) => {
  const subtotalUSD = items.reduce((sum, item) => sum + (item.priceUSD * item.quantity), 0);
  const shippingUSD = items.reduce((sum, item) => sum + ((item.shippingRates?.[userCountry.code] || 0) * item.quantity), 0);
  
  const totalUSD = subtotalUSD + shippingUSD;
  const totalLocal = totalUSD * userCountry.rateToUSD;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="bg-gray-100 p-8 rounded-full mb-6 text-gray-300"><i className="fas fa-shopping-basket text-6xl"></i></div>
        <h2 className="text-2xl font-bold mb-2">سلة التسوق فارغة</h2>
        <p className="text-gray-500 mb-8">اختر بلداً وابدأ بالتسوق الآن.</p>
        <button onClick={() => window.location.hash = ''} className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold">تصفح المنتجات</button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-4 py-8">
      <div className="lg:col-span-2 space-y-4">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <i className="fas fa-shipping-fast text-indigo-600"></i>
          شحن إلى {userCountry.name}
        </h2>
        
        {items.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm flex items-center space-x-reverse space-x-4 border border-gray-50">
            <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-xl" />
            <div className="flex-1">
              <h3 className="font-bold text-lg">{item.name}</h3>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center border rounded-lg overflow-hidden scale-90">
                  <button onClick={() => onUpdateQuantity(item.id, -1)} className="px-3 py-1 bg-gray-50">-</button>
                  <span className="px-4 py-1 font-medium">{item.quantity}</span>
                  <button onClick={() => onUpdateQuantity(item.id, 1)} className="px-3 py-1 bg-gray-50">+</button>
                </div>
                <button onClick={() => onRemove(item.id)} className="text-red-500 text-xs hover:underline font-bold">حذف</button>
              </div>
              <p className="text-[10px] text-gray-400 mt-2">تكلفة شحن المنتج: {((item.shippingRates?.[userCountry.code] || 0) * userCountry.rateToUSD).toFixed(2)} {userCountry.symbol}</p>
            </div>
            <div className="text-left font-black text-indigo-600">
              {(item.priceUSD * item.quantity * userCountry.rateToUSD).toFixed(userCountry.code === 'KW' ? 3 : 2)} {userCountry.symbol}
            </div>
          </div>
        ))}
      </div>

      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-50">
          <h3 className="text-xl font-bold mb-6">تفاصيل الفاتورة</h3>
          <div className="space-y-4 mb-6 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>المجموع (منتجات)</span>
              <span>{(subtotalUSD * userCountry.rateToUSD).toFixed(2)} {userCountry.symbol}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>تكلفة الشحن لـ {userCountry.code}</span>
              <span>{(shippingUSD * userCountry.rateToUSD).toFixed(2)} {userCountry.symbol}</span>
            </div>
            <div className="border-t pt-4 flex justify-between font-black text-2xl text-indigo-700">
              <span>الإجمالي</span>
              <span>{totalLocal.toFixed(userCountry.code === 'KW' ? 3 : 2)} {userCountry.symbol}</span>
            </div>
          </div>
          <button onClick={onCheckout} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black text-lg hover:shadow-xl transition">إتمام الدفع الآمن</button>
          <p className="mt-4 text-[10px] text-gray-400 text-center">السعر بالدولار الأمريكي: {totalUSD.toFixed(2)}$</p>
        </div>
      </div>
    </div>
  );
};

export default Cart;
