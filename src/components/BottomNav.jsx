import React from 'react';
import { Home, PieChart, Plus, Wallet, Settings, TrendingUp } from 'lucide-react';

const BottomNav = ({ activeTab, setActiveTab, onOpenForm }) => {
  return (
    <div className="bottom-nav">
      
      {/* Sol Grup (2 İkon) */}
      <div className="flex justify-around items-center" style={{ flex: 1 }}>
        <button 
          onClick={() => setActiveTab('dashboard')} 
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
        >
          <Home size={24} strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} />
          <span>Özet</span>
        </button>

        <button 
          onClick={() => setActiveTab('accounts')} 
          className={`nav-item ${activeTab === 'accounts' ? 'active' : ''}`}
        >
          <Wallet size={24} strokeWidth={activeTab === 'accounts' ? 2.5 : 2} />
          <span>Hesaplar</span>
        </button>
      </div>
      
      {/* Orta Boşluk (FAB için yer tutucu) */}
      <div style={{ width: '64px', flexShrink: 0 }}></div>
      
      <button 
        onClick={onOpenForm}
        className="fab"
      >
        <Plus size={32} strokeWidth={2.5} />
      </button>
      
      {/* Sağ Grup (3 İkon) */}
      <div className="flex justify-around items-center" style={{ flex: 1 }}>
        <button 
          onClick={() => setActiveTab('charts')} 
          className={`nav-item ${activeTab === 'charts' ? 'active' : ''}`}
        >
          <PieChart size={24} strokeWidth={activeTab === 'charts' ? 2.5 : 2} />
          <span>Raporlar</span>
        </button>

        <button 
          onClick={() => setActiveTab('rates')} 
          className={`nav-item ${activeTab === 'rates' ? 'active' : ''}`}
        >
          <TrendingUp size={24} strokeWidth={activeTab === 'rates' ? 2.5 : 2} />
          <span>Kurlar</span>
        </button>

        <button 
          onClick={() => setActiveTab('settings')} 
          className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
        >
          <Settings size={24} strokeWidth={activeTab === 'settings' ? 2.5 : 2} />
          <span>Ayarlar</span>
        </button>
      </div>

      {/* Geliştirici Bilgisi */}
      <div className="absolute bottom-1 left-0 w-full text-center">
        <a 
          href="https://wa.me/905464302228?text=Merhaba%20Salih%20Bey,%20Aile%20B%C3%BCt%C3%A7esi%20uygulamas%C4%B1%20hakk%C4%B1nda%20yaz%C4%B1yorum." 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[9px] text-muted hover:text-primary opacity-60 hover:opacity-100 transition-opacity font-medium tracking-wider"
        >
          Geliştirici: Salih Duman • 0546 430 22 28
        </a>
      </div>

    </div>
  );
};

export default BottomNav;
