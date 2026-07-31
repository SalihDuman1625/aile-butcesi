import React from 'react';
import { Home, PieChart, Plus, Wallet, Settings } from 'lucide-react';

const BottomNav = ({ activeTab, setActiveTab, onOpenForm }) => {
  return (
    <div className="bottom-nav">
      
      {/* Sol Grup */}
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
      
      {/* Orta Boşluk (FAB için yer tutucu) */}
      <div style={{ width: '64px', flexShrink: 0 }}></div>
      
      <button 
        onClick={onOpenForm}
        className="fab"
      >
        <Plus size={32} strokeWidth={2.5} />
      </button>
      
      {/* Sağ Grup */}
      <button 
        onClick={() => setActiveTab('charts')} 
        className={`nav-item ${activeTab === 'charts' ? 'active' : ''}`}
      >
        <PieChart size={24} strokeWidth={activeTab === 'charts' ? 2.5 : 2} />
        <span>Raporlar</span>
      </button>

      <button 
        onClick={() => setActiveTab('settings')} 
        className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
      >
        <Settings size={24} strokeWidth={activeTab === 'settings' ? 2.5 : 2} />
        <span>Ayarlar</span>
      </button>

    </div>
  );
};

export default BottomNav;
