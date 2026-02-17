
import React, { useRef, useState } from 'react';
import { View } from '../types';

interface HeaderProps {
  currentView: View;
  setView: (view: View) => void;
  cartCount: number;
  onLogoLongPress: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView, cartCount, onLogoLongPress, searchQuery, setSearchQuery }) => {
  const pressTimer = useRef<any>(null);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const handleMouseDown = () => {
    pressTimer.current = setTimeout(() => {
      onLogoLongPress();
    }, 2000); 
  };

  const handleMouseUp = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 h-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer select-none active:scale-95 transition-transform" 
            onClick={() => { setView('home'); setSearchQuery(''); }}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchEnd={handleMouseUp}
          >
            <div className="bg-amber-600 p-2 rounded-xl text-white mr-3 shadow-lg shadow-amber-100">
              <i className="fas fa-crown text-lg"></i>
            </div>
            <span className="text-xl font-black text-gray-900 tracking-tight hidden sm:block">
              سفير الخليج
            </span>
          </div>

          <nav className="hidden lg:flex space-x-reverse space-x-8 items-center">
            <button 
              onClick={() => { setView('home'); setSearchQuery(''); }}
              className={`text-sm font-black transition-colors ${currentView === 'home' && !searchQuery ? 'text-amber-600' : 'text-gray-400'}`}
            >
              الرئيسية
            </button>
            <button className="text-sm font-black text-gray-400">عن السفير</button>
          </nav>

          <div className="flex items-center space-x-reverse space-x-3 md:space-x-4">
            {/* Smart Search Bar */}
            <div className={`relative flex items-center transition-all duration-500 ${isSearchExpanded ? 'w-48 md:w-64' : 'w-10 md:w-12'}`}>
               <input 
                 type="text" 
                 placeholder="ابحث عن منتج، عطر..."
                 className={`w-full bg-gray-50 border border-gray-100 rounded-xl py-2 pr-10 pl-4 text-xs font-bold focus:ring-2 focus:ring-amber-600 transition-all duration-500 outline-none ${isSearchExpanded ? 'opacity-100' : 'opacity-0 cursor-default pointer-events-none'}`}
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 onFocus={() => setIsSearchExpanded(true)}
               />
               <button 
                 onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                 className={`absolute right-0 w-10 md:w-12 h-10 md:h-10 flex items-center justify-center text-gray-400 hover:text-amber-600 transition-colors ${isSearchExpanded ? 'bg-transparent' : 'bg-gray-50 rounded-xl border border-gray-100'}`}
               >
                 <i className={`fas ${isSearchExpanded ? 'fa-times' : 'fa-search'}`}></i>
               </button>
            </div>

            <button 
              onClick={() => setView('cart')}
              className="relative p-2.5 bg-gray-50 rounded-xl text-gray-600 hover:text-amber-600 transition-all border border-gray-100"
            >
              <i className="fas fa-shopping-cart text-lg"></i>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-black rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
