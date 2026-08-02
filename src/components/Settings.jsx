import React, { useState } from 'react';
import { useBudget } from '../context/BudgetContext';
import { Moon, Sun, Users, UserPlus, ShieldAlert, Download, Trash2, CheckCircle2, Lock, Unlock, Key, Send, BookOpen } from 'lucide-react';
import { generateLicenseCode } from './ActivationGuard';
import GuideModal from './GuideModal';

const Settings = () => {
  const { 
    theme, toggleTheme, 
    users, currentUser, setActiveUserId, addUser, deleteUser, changeUserPin,
    resetAllData, transactions, accounts, bills
  } = useBudget();

  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('standart');
  const [newUserPin, setNewUserPin] = useState('');
  
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);
  
  // Pin Validation for switching users
  const [pendingUserId, setPendingUserId] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Change PIN for current user
  // Change PIN for current user
  const [newPinForCurrent, setNewPinForCurrent] = useState('');
  const [showChangePin, setShowChangePin] = useState(false);

  // License Generator
  const [licenseTargetId, setLicenseTargetId] = useState('');
  const [generatedLicense, setGeneratedLicense] = useState('');

  // Guide
  const [showGuide, setShowGuide] = useState(false);

  const handleGenerateLicense = () => {
    if (!licenseTargetId) return;
    const code = generateLicenseCode(licenseTargetId);
    setGeneratedLicense(code);
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUserName.trim()) return;
    addUser(newUserName, newUserRole, newUserPin);
    setNewUserName('');
    setNewUserPin('');
  };

  const handleUserSelect = (e) => {
    const selectedId = e.target.value;
    const targetUser = users.find(u => u.id === selectedId);
    
    // Geçiş yapılmak istenen kullanıcının PIN'i varsa ve biz o kullanıcı değilsek PIN sor
    if (targetUser && targetUser.pin && targetUser.pin !== '' && targetUser.id !== currentUser.id) {
      setPendingUserId(selectedId);
      setPinInput('');
      setPinError(false);
    } else {
      setActiveUserId(selectedId);
    }
  };

  const submitPin = () => {
    const targetUser = users.find(u => u.id === pendingUserId);
    if (targetUser && targetUser.pin === pinInput) {
      setActiveUserId(pendingUserId);
      setPendingUserId(null);
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  const handleChangeMyPin = (e) => {
    e.preventDefault();
    changeUserPin(currentUser.id, newPinForCurrent);
    setShowChangePin(false);
    setNewPinForCurrent('');
    alert("Şifreniz başarıyla güncellendi.");
  };

  const handleExportData = () => {
    const data = { transactions, accounts, bills };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `AileButcesi_Yedek_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleWipeData = () => {
    if (currentUser.role !== 'admin') {
      alert("Sadece yöneticiler tüm veriyi silebilir!");
      return;
    }
    resetAllData();
    setShowWipeConfirm(false);
    alert("Tüm işlem ve hesap verileri başarıyla sıfırlandı.");
  };

  return (
    <div className="pb-24 slide-in p-4">
      <button 
        onClick={() => setShowGuide(true)} 
        className="w-full mb-6 p-4 rounded-xl flex items-center justify-between text-white shadow-lg transition-transform hover:scale-[1.02]"
        style={{ background: 'linear-gradient(135deg, var(--primary-color) 0%, #3B82F6 100%)' }}
      >
        <div className="flex items-center gap-3">
          <BookOpen size={24} />
          <div className="text-left">
            <h3 className="font-bold text-lg leading-tight">Kullanım Kılavuzu</h3>
            <p className="text-sm opacity-90">Uygulamanın nasıl çalıştığını öğrenin</p>
          </div>
        </div>
        <span className="font-bold text-xl">→</span>
      </button>

      <div className="flex flex-col gap-6">
      
      <div className="mt-2 mb-2">
        <h2 className="text-2xl font-bold text-main">Ayarlar</h2>
        <p className="text-muted mt-1 text-sm">Görünüm, Yetkilendirme ve Veri Yönetimi</p>
      </div>

      {/* 1. KULLANICI DEĞİŞTİRME */}
      <div className="card flex flex-col gap-3 relative">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Users size={20} className="text-primary"/> Aktif Kullanıcı (Kimsiniz?)
        </h3>
        <p className="text-sm text-muted">Şu an uygulamayı kim kullanıyorsa onu seçin.</p>
        
        <select 
          value={currentUser.id} 
          onChange={handleUserSelect}
          className="form-input font-bold"
        >
          {users.map(u => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.role === 'admin' ? 'Yönetici' : 'Standart'}) {u.pin ? '🔒' : ''}
            </option>
          ))}
        </select>
        
        {currentUser.role === 'admin' ? (
          <div className="text-xs text-success flex items-center gap-1 mt-1 font-semibold"><CheckCircle2 size={14}/> Yönetici yetkileriniz aktif.</div>
        ) : (
          <div className="text-xs text-warning flex items-center gap-1 mt-1 text-yellow-600 font-semibold"><ShieldAlert size={14}/> Standart üyesiniz. Başkasının verisini silemezsiniz.</div>
        )}

        {/* PIN Değiştirme Butonu */}
        {!showChangePin ? (
          <button onClick={() => setShowChangePin(true)} className="text-sm text-primary font-bold flex items-center gap-1 mt-2 w-fit">
            <Lock size={14}/> {currentUser.pin ? 'Şifremi (PIN) Değiştir' : 'Profilime Şifre (PIN) Koy'}
          </button>
        ) : (
          <form onSubmit={handleChangeMyPin} className="mt-2 flex gap-2">
            <input 
              type="password" 
              maxLength="4" 
              placeholder="Yeni 4 Haneli PIN" 
              value={newPinForCurrent}
              onChange={e => setNewPinForCurrent(e.target.value.replace(/[^0-9]/g, ''))}
              className="form-input flex-1" 
              style={{ padding: '0.4rem' }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', width: 'auto' }}>Kaydet</button>
            <button type="button" onClick={() => setShowChangePin(false)} className="btn" style={{ padding: '0.4rem 0.8rem', width: 'auto', backgroundColor: '#e5e7eb' }}>İptal</button>
          </form>
        )}
      </div>

      {/* 2. TEMA AYARLARI */}
      <div className="card flex justify-between items-center cursor-pointer hover:border-primary" onClick={toggleTheme}>
        <div>
          <h3 className="font-bold text-lg flex items-center gap-2">
            {theme === 'dark' ? <Moon size={20} className="text-primary"/> : <Sun size={20} className="text-primary"/>} 
            Görünüm (Tema)
          </h3>
          <p className="text-sm text-muted mt-1">{theme === 'dark' ? 'Karanlık Mod' : 'Aydınlık Mod'} aktif.</p>
        </div>
        <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
          {theme === 'dark' ? <Moon size={24}/> : <Sun size={24}/>}
        </div>
      </div>

      {/* 3. AİLE ÜYELERİ YÖNETİMİ (SADECE ADMİN) */}
      <div className="card flex flex-col gap-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <UserPlus size={20} className="text-primary"/> Aile Üyeleri
        </h3>
        
        {currentUser.role !== 'admin' ? (
          <p className="text-sm text-danger bg-danger-light p-3 rounded-lg">
            Sadece yöneticiler yeni aile üyesi ekleyebilir.
          </p>
        ) : (
          <>
            <form onSubmit={handleAddUser} className="flex flex-col gap-2 bg-gray-50 p-3 rounded-xl border border-border" style={{ backgroundColor: 'var(--bg-color)' }}>
              <p className="text-sm font-semibold mb-1">Yeni Üye Ekle</p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="İsim" 
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  className="form-input flex-1"
                  style={{ padding: '0.5rem' }}
                  required
                />
                <select 
                  value={newUserRole} 
                  onChange={e => setNewUserRole(e.target.value)}
                  className="form-input"
                  style={{ padding: '0.5rem', width: '110px' }}
                >
                  <option value="standart">Standart</option>
                  <option value="admin">Yönetici</option>
                </select>
              </div>
              <input 
                  type="password" 
                  placeholder="PIN Kodu (Opsiyonel 4 Hane)" 
                  maxLength="4"
                  value={newUserPin}
                  onChange={e => setNewUserPin(e.target.value.replace(/[^0-9]/g, ''))}
                  className="form-input"
                  style={{ padding: '0.5rem' }}
                />
              <button type="submit" className="btn btn-primary mt-1" style={{ padding: '0.5rem' }}>Ekle</button>
            </form>

            <div className="flex flex-col gap-2 mt-2">
              <p className="text-sm font-semibold text-muted">Mevcut Üyeler</p>
              {users.map(u => (
                <div key={u.id} className="flex justify-between items-center p-2 border-b border-border last:border-0">
                  <div>
                    <span className="font-bold">{u.name}</span>
                    <span className={`text-xs ml-2 px-2 py-1 rounded-full ${u.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                      {u.role === 'admin' ? 'Yönetici' : 'Standart'}
                    </span>
                    {u.pin && <span className="text-xs ml-1" title="Şifre Korumalı">🔒</span>}
                  </div>
                  {u.id !== currentUser.id && (
                     <button onClick={() => deleteUser(u.id)} className="text-danger p-1"><Trash2 size={18}/></button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* LİSANS ÜRETİCİ (SADECE ANA KURUCU) */}
      {localStorage.getItem('is_master_admin') === 'true' && (
        <div className="card flex flex-col gap-4 border-2 border-primary border-opacity-30">
          <h3 className="font-bold text-lg flex items-center gap-2 text-primary">
            <Key size={20} /> Lisans Dağıtıcı (Keygen)
          </h3>
          <p className="text-sm text-muted">Uygulamayı kullanmak isteyen arkadaşlarınıza cihaz kodlarını sorup, buradan aktivasyon kodu üretebilirsiniz.</p>
          
          <div className="flex flex-col gap-2">
            <input 
              type="text"
              placeholder="Arkadaşınızın Cihaz Kodunu (örn: ABC123XX) girin"
              value={licenseTargetId}
              onChange={(e) => {
                setLicenseTargetId(e.target.value.toUpperCase());
                setGeneratedLicense('');
              }}
              className="form-input uppercase font-mono tracking-widest"
              maxLength={8}
            />
            <button 
              onClick={handleGenerateLicense}
              className="btn btn-primary"
              disabled={!licenseTargetId || licenseTargetId.length < 5}
            >
              Lisans Kodu Üret
            </button>
          </div>

          {generatedLicense && (
            <div className="bg-green-50 border border-green-200 p-3 rounded-lg text-center mt-2" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
              <p className="text-xs text-muted mb-1">Üretilen Aktivasyon Kodu:</p>
              <p className="text-xl font-mono font-bold tracking-widest text-green-600 mb-2">{generatedLicense}</p>
              <button 
                onClick={() => {
                  const text = `Aile Bütçesi uygulamasına hoş geldin!\n\nSenin için oluşturduğum aktivasyon kodun: *${generatedLicense}*\n\nAşağıdaki sihirli linke tıklayarak uygulamayı anında açabilirsin:\nhttps://benim-butcem.netlify.app/?aktivasyon=${generatedLicense}`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                }}
                className="btn text-sm py-1 px-3 mx-auto flex items-center gap-1"
                style={{ backgroundColor: '#25D366', color: 'white', width: 'fit-content' }}
              >
                <Send size={14} /> WhatsApp ile Gönder (Linkli)
              </button>
            </div>
          )}
        </div>
      )}

      {/* 4. VERİ YÖNETİMİ */}
      <div className="card flex flex-col gap-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Download size={20} className="text-primary"/> Veri Yönetimi
        </h3>
        
        <button onClick={handleExportData} className="btn" style={{ backgroundColor: '#10B981', color: 'white' }}>
          Tüm Veriyi İndir (Yedekle)
        </button>

        {currentUser.role === 'admin' && (
          <div className="mt-4 border-t border-border pt-4">
            {!showWipeConfirm ? (
              <button onClick={() => setShowWipeConfirm(true)} className="btn w-full" style={{ backgroundColor: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)' }}>
                Tüm Sistemi Sıfırla (Tehlikeli)
              </button>
            ) : (
              <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-center">
                <p className="text-red-700 font-bold mb-3">Tüm veriler kalıcı olarak silinecek. Emin misiniz?</p>
                <div className="flex gap-2">
                  <button onClick={() => setShowWipeConfirm(false)} className="btn flex-1" style={{ backgroundColor: '#9CA3AF' }}>İptal</button>
                  <button onClick={handleWipeData} className="btn flex-1 btn-primary" style={{ backgroundColor: 'var(--danger)' }}>Sıfırla</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      </div>

      {/* PIN ENTRY MODAL */}
      {pendingUserId && (
        <div className="modal-overlay" style={{ alignItems: 'center' }}>
          <div className="card w-11/12 max-w-sm flex flex-col gap-4" style={{ animation: 'none', margin: 'auto' }}>
            <div className="text-center">
              <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <Lock size={24} />
              </div>
              <h3 className="font-bold text-xl">Profil Kilitli</h3>
              <p className="text-sm text-muted mt-1">Bu profile geçmek için 4 haneli PIN giriniz.</p>
            </div>
            
            <input 
              type="password" 
              maxLength="4"
              value={pinInput}
              onChange={e => {
                setPinInput(e.target.value.replace(/[^0-9]/g, ''));
                setPinError(false);
              }}
              placeholder="****"
              className="form-input text-center text-2xl tracking-widest font-bold"
              autoFocus
            />
            {pinError && <p className="text-danger text-sm text-center font-bold">Hatalı Şifre!</p>}

            <div className="flex gap-2 mt-2">
              <button onClick={() => setPendingUserId(null)} className="btn flex-1" style={{ backgroundColor: '#e5e7eb', color: '#374151' }}>İptal</button>
              <button onClick={submitPin} className="btn btn-primary flex-1">Giriş Yap</button>
            </div>
          </div>
        </div>
      )}

      {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}
    </div>
  );
};

export default Settings;
