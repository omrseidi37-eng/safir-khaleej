
import React, { useState, useEffect } from 'react';

interface WelcomePopupProps {
  show: boolean;
  onClose: () => void;
}

const WelcomePopup: React.FC<WelcomePopupProps> = ({ show, onClose }) => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
    }
  }, [show]);

  if (!show && !shouldRender) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center px-4 transition-opacity duration-500 ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-md" onClick={onClose}></div>
      
      <div className={`relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 text-center transition-transform duration-500 transform ${show ? 'scale-100' : 'scale-90'}`}>
        <div className="flex justify-center mb-6">
          <div className="bg-amber-600 w-20 h-20 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-amber-200">
            <i className="fas fa-crown text-4xl"></i>
          </div>
        </div>
        
        <h2 className="text-2xl font-black text-gray-900 mb-4">مرحباً بكم في سفير الخليج</h2>
        
        <div className="space-y-4 mb-8">
          <p className="text-gray-600 leading-relaxed">
            نسعد بأن نكون <span className="font-bold text-amber-600">سفيركم التجاري الموثوق</span> الذي يجوب العالم ليأتيكم بأرقى المنتجات العالمية.
          </p>
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
            <p className="text-xs text-amber-700 font-bold leading-relaxed">
              <i className="fas fa-check-circle ml-2"></i>
              نحن نضمن جودة كل منتج ونوفر لك شحناً مباشراً آمناً وحماية كاملة لعمليات الدفع.
            </p>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full bg-amber-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-amber-700 hover:shadow-xl transition active:scale-95 shadow-lg shadow-amber-100"
        >
          تفضل بالدخول، يا هلا
        </button>
        
        <p className="mt-6 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          أصالة في التعامل .. فخامة في الاختيار
        </p>
      </div>
    </div>
  );
};

export default WelcomePopup;
