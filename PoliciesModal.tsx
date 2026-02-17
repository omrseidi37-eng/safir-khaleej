
import React from 'react';

interface PoliciesModalProps {
  show: boolean;
  onClose: () => void;
}

const PoliciesModal: React.FC<PoliciesModalProps> = ({ show, onClose }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center px-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col border border-amber-100">
        <div className="bg-gray-900 p-8 text-center relative">
          <button onClick={onClose} className="absolute top-6 left-6 text-gray-400 hover:text-white transition-colors">
            <i className="fas fa-times text-xl"></i>
          </button>
          <div className="bg-amber-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-xl">
            <i className="fas fa-shield-check text-2xl"></i>
          </div>
          <h2 className="text-2xl font-black text-white">سياسة الاسترجاع والضمان</h2>
          <p className="text-amber-400 text-xs font-bold mt-2 uppercase tracking-widest">ضمان الجودة والفخامة من سفير الخليج</p>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar text-right space-y-8">
          <section>
            <h3 className="text-lg font-black text-gray-900 mb-3 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-amber-600 rounded-full"></span>
              سياسة الاستبدال والاسترجاع
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed font-medium">
              نلتزم في "سفير الخليج" بتقديم أعلى معايير الجودة. يحق للعميل طلب الاسترجاع أو الاستبدال خلال <span className="text-amber-600 font-bold">7 أيام</span> من تاريخ استلام المنتج، بشرط أن يكون المنتج في حالته الأصلية وبتغليفه الأصلي ولم يتم استخدامه.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-black text-gray-900 mb-3 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-amber-600 rounded-full"></span>
              الضمان الذهبي للسفير
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed font-medium">
              كافة الأجهزة الإلكترونية مشمولة بضمان لمدة <span className="text-amber-600 font-bold">سنتين</span> ضد العيوب المصنعية. في حال وجود خلل فني، نتكفل بعملية الصيانة أو الاستبدال بمنتج جديد تماماً دون أي تكاليف إضافية على العميل.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-black text-gray-900 mb-3 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-amber-600 rounded-full"></span>
              إجراءات الشحن المباشر
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed font-medium">
              بصفتنا سفيركم التجاري، نقوم بفحص كل قطعة بدقة قبل شحنها مباشرة من مستودعاتنا العالمية لضمان وصولها إليكم بأفضل حلة وفخامة تليق بكم.
            </p>
          </section>
        </div>

        <div className="p-8 bg-gray-50 border-t border-gray-100 text-center">
          <button 
            onClick={onClose}
            className="bg-gray-900 text-white px-12 py-4 rounded-2xl font-black text-sm hover:bg-black transition-all shadow-xl active:scale-95"
          >
            فهمت ذلك، شكراً لكم
          </button>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d97706; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default PoliciesModal;
