import React, { useState, useEffect } from 'react';
import { Lock, Key, Send } from 'lucide-react';

// Secret salt used for hashing (Never exposed to the user directly, only in JS bundle)
const SECRET_SALT = "MALIORTAK_SALIH_2026_SECURE";

// Simple hash function for offline activation
export const generateLicenseCode = (deviceId) => {
  let hash = 0;
  const str = deviceId + SECRET_SALT;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).toUpperCase().substring(0, 8);
};

const ActivationGuard = ({ children }) => {
  const [isLicensed, setIsLicensed] = useState(true); // Assume true until checked
  const [deviceId, setDeviceId] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // 1. Check if already licensed
    const licensed = localStorage.getItem('app_licensed');
    if (licensed === 'true') {
      setIsLicensed(true);
      return;
    }

    // 2. Auto-license original creator (if they have existing users/transactions)
    const existingUsers = localStorage.getItem('budget_users');
    if (existingUsers && JSON.parse(existingUsers).length > 0) {
      localStorage.setItem('app_licensed', 'true');
      setIsLicensed(true);
      return;
    }

    // 3. Needs license
    setIsLicensed(false);
    
    // Generate or get Device ID
    let currentDeviceId = localStorage.getItem('app_device_id');
    if (!currentDeviceId) {
      currentDeviceId = Math.random().toString(36).substring(2, 10).toUpperCase();
      localStorage.setItem('app_device_id', currentDeviceId);
    }
    setDeviceId(currentDeviceId);

  }, []);

  const handleActivate = () => {
    if (!inputCode) return;
    
    const expectedCode = generateLicenseCode(deviceId);
    
    if (inputCode.trim().toUpperCase() === expectedCode) {
      localStorage.setItem('app_licensed', 'true');
      setIsLicensed(true);
    } else {
      setError('Geçersiz Lisans Kodu! Lütfen yöneticiden aldığınız kodu doğru girin.');
    }
  };

  const handleSendWhatsApp = () => {
    const text = `Merhaba, Aile Bütçesi uygulaması için lisans talep ediyorum.\n\nCihaz Kodum: *${deviceId}*\n\nUygulamayı kullanabilmem için bana bir aktivasyon kodu gönderebilir misin?`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (isLicensed) {
    return children;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6" style={{ background: 'var(--bg-color)', color: 'var(--text-main)', textAlign: 'center' }}>
      <div className="card w-full max-w-sm flex flex-col items-center p-8 text-center" style={{ background: 'var(--card-bg)' }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary-color)' }}>
          <Lock size={32} />
        </div>
        
        <h2 className="text-2xl font-bold mb-2">Aktivasyon Gerekli</h2>
        <p className="text-muted mb-6" style={{ fontSize: '0.9rem' }}>
          Bu uygulama lisanslı bir üründür. Kullanmak için yönetici onayına ihtiyacınız var.
        </p>

        <div className="w-full p-4 rounded-xl mb-6 border border-dashed" style={{ backgroundColor: 'rgba(0,0,0,0.03)', borderColor: 'var(--border-color)' }}>
          <p className="text-xs text-muted mb-1 uppercase font-bold tracking-wider">Sizin Cihaz Kodunuz</p>
          <p className="text-2xl font-mono font-bold tracking-widest" style={{ color: 'var(--primary-color)' }}>{deviceId}</p>
        </div>

        <button 
          onClick={handleSendWhatsApp}
          className="btn flex items-center justify-center gap-2 mb-8 w-full"
          style={{ backgroundColor: '#25D366', color: 'white' }}
        >
          <Send size={18} /> Kodu Yöneticiye Gönder
        </button>

        <div className="w-full h-px mb-8 relative" style={{ backgroundColor: 'var(--border-color)' }}>
          <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-3 text-xs text-muted font-bold" style={{ background: 'var(--card-bg)' }}>LİSANS GİRİŞİ</span>
        </div>

        <div className="form-group w-full mb-4">
          <label className="form-label text-left">Aktivasyon Kodu</label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" size={18} />
            <input
              type="text"
              value={inputCode}
              onChange={(e) => { setInputCode(e.target.value); setError(''); }}
              placeholder="KOD-XXXXX"
              className="form-input w-full pl-10 uppercase font-mono"
            />
          </div>
        </div>

        {error && <p className="text-sm mb-4" style={{ color: 'var(--danger)' }}>{error}</p>}

        <button onClick={handleActivate} className="btn btn-primary w-full">
          Kilidi Aç
        </button>
      </div>
    </div>
  );
};

export default ActivationGuard;
