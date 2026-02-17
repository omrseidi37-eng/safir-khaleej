
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Product, CountryConfig, Review } from '../types';
import { speakProductDescription } from '../services/geminiService';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  localCurrency: CountryConfig;
  onKeyError?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, localCurrency, onKeyError }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const stockCount = useMemo(() => Math.floor(Math.random() * 5) + 2, [product.id]);
  const localPrice = product.priceUSD * localCurrency.rateToUSD;

  useEffect(() => {
    return () => {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
      }
    };
  }, []);

  const handleToggleVoice = async () => {
    if (isPlaying) {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current = null;
      }
      setIsPlaying(false);
      return;
    }

    if (!product.description) return;

    let ctx = audioContext;
    if (!ctx) {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(ctx);
    }
    if (ctx.state === 'suspended') await ctx.resume();

    setIsPlaying(true);
    try {
      const source = await speakProductDescription(product.description, ctx);
      if (source) {
        sourceNodeRef.current = source;
        source.onended = () => {
          setIsPlaying(false);
          sourceNodeRef.current = null;
        };
        source.start();
      }
    } catch (error: any) {
      setIsPlaying(false);
      
      // معالجة خطأ الصلاحيات 403
      if (error.message?.includes('403') || error.status === 403 || error.message?.includes('permission')) {
        const confirmSetup = window.confirm("عذراً، المساعد (منصور) يتطلب تفعيل 'مفتاح الوصول المدفوع' ليعمل. هل تريد تفعيله الآن؟");
        if (confirmSetup && onKeyError) {
          onKeyError();
        }
      } else {
        alert("عذراً، حدث خطأ أثناء تشغيل صوت المساعد. يرجى المحاولة لاحقاً.");
      }
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <i key={i} className={`fas fa-star text-[10px] ${i < rating ? 'text-amber-500' : 'text-gray-200'}`}></i>
    ));
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden group border border-gray-100 flex flex-col h-full">
      <div className="relative h-72 overflow-hidden bg-gray-50">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute top-4 right-4">
          <div className="bg-white/95 backdrop-blur px-4 py-1.5 rounded-full text-[10px] font-black text-amber-600 shadow-xl border border-amber-50 uppercase tracking-widest">
            {product.category}
          </div>
        </div>
        <div className="absolute bottom-4 left-4 bg-red-600 text-white text-[9px] font-bold px-3 py-1 rounded-full animate-pulse">
           بقي {stockCount} قطع في مخزن {localCurrency.name.split(' ').pop()}
        </div>
      </div>
      
      <div className="p-6 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold group-hover:text-amber-600 transition-colors truncate flex-grow ml-2">{product.name}</h3>
          <div className="flex items-center gap-1 mt-1">
             <span className="text-[10px] font-black text-amber-500">4.9</span>
             {renderStars(5)}
          </div>
        </div>
        <p className="text-gray-400 text-xs mb-6 line-clamp-2 leading-relaxed">{product.description}</p>
        
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col">
              <span className="text-2xl font-black text-gray-900">
                {localPrice.toFixed(localCurrency.code === 'KW' ? 3 : 2)} 
                <span className="text-sm mr-1">{localCurrency.symbol}</span>
              </span>
              <span className="text-[10px] text-gray-300 font-bold">شحن مباشر من السفير</span>
            </div>
            
            <button 
              onClick={handleToggleVoice} 
              className={`w-12 h-12 rounded-2xl transition-all duration-300 flex items-center justify-center shadow-lg ${isPlaying ? 'bg-red-500 text-white scale-110 animate-pulse' : 'bg-gray-50 text-gray-400 hover:bg-amber-50 hover:text-amber-600'}`}
              title={isPlaying ? "إيقاف الوصف" : "استمع لوصف منصور الرزين"}
            >
              <i className={`fas ${isPlaying ? 'fa-stop' : 'fa-play'} text-lg`}></i>
            </button>
          </div>
          
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => onAddToCart(product)} 
              className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black hover:bg-amber-600 transition-all duration-300 flex items-center justify-center space-x-reverse space-x-3 shadow-lg hover:shadow-amber-200 group/btn active:scale-95"
            >
              <i className="fas fa-shopping-basket group-hover/btn:rotate-12 transition-transform"></i>
              <span>أضف للسلة الآن</span>
            </button>

            <button 
              onClick={() => setShowReviews(!showReviews)}
              className="text-[10px] font-black text-gray-400 hover:text-amber-600 transition-colors flex items-center justify-center gap-2 py-2"
            >
              <i className={`fas ${showReviews ? 'fa-chevron-up' : 'fa-comments'}`}></i>
              {showReviews ? 'إخفاء الآراء' : `آراء عملائنا في السعودية (${product.reviews?.length || 0})`}
            </button>
          </div>
        </div>
      </div>

      {showReviews && (
        <div className="bg-gray-50/80 border-t border-gray-100 p-6 animate-in slide-in-from-bottom-2 duration-300">
          <div className="mb-4 flex items-center justify-between border-b border-amber-100 pb-3">
             <h4 className="text-xs font-black text-gray-900 flex items-center gap-2">
               <i className="fas fa-quote-right text-amber-500"></i>
               آراء عملائنا في السعودية
             </h4>
             <div className="flex -space-x-reverse -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className="w-5 h-5 rounded-full border-2 border-white bg-amber-100 flex items-center justify-center text-[8px] font-bold text-amber-600">
                    <i className="fas fa-user"></i>
                  </div>
                ))}
             </div>
          </div>
          
          <div className="space-y-4 max-h-[300px] overflow-y-auto no-scrollbar">
            {product.reviews?.map((review) => (
              <div key={review.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-[11px] font-black text-gray-900 block">{review.userName}</span>
                    <span className="text-[9px] text-gray-400 font-medium">{review.location} • {review.date}</span>
                  </div>
                  <div className="flex">
                    {renderStars(review.rating)}
                  </div>
                </div>
                <p className="text-[10px] text-gray-600 leading-relaxed font-medium mb-3 italic">"{review.comment}"</p>
                {review.image && (
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-amber-50 group/img">
                    <img src={review.image} className="w-full h-full object-cover" alt="تصوير العميل" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                       <i className="fas fa-expand text-white text-[10px]"></i>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-[8px] text-amber-600 font-black uppercase tracking-widest border-t border-amber-50 pt-3">
             <i className="fas fa-check-circle"></i>
             <span>تقييمات حقيقية موثقة من عملائنا</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
