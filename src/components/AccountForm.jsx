import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useBudget } from '../context/BudgetContext';

const AccountForm = ({ onClose, accountToEdit }) => {
  const { addAccount, editAccount } = useBudget();
  const [name, setName] = useState('');
  const [type, setType] = useState('bank');
  
  // Normal Bakiye (TL)
  const [balance, setBalance] = useState('');

  // Yatırım/Birikim Özel
  const [assetType, setAssetType] = useState('TL');
  const [assetAmount, setAssetAmount] = useState('');
  const [assetRate, setAssetRate] = useState('');

  useEffect(() => {
    if (accountToEdit) {
      setName(accountToEdit.name);
      setType(accountToEdit.type);
      setBalance(accountToEdit.balance);
      
      if (accountToEdit.type === 'investment') {
        setAssetType(accountToEdit.assetType || 'TL');
        setAssetAmount(accountToEdit.assetAmount || '');
        setAssetRate(accountToEdit.assetRate || '');
      }
    }
  }, [accountToEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;

    let finalBalance = parseFloat(balance || 0);

    // Eğer yatırım hesabıysa ve TL değilse bakiyeyi Miktar * Kur olarak hesapla
    let finalAssetData = {};
    if (type === 'investment') {
      if (assetType !== 'TL') {
        const amt = parseFloat(assetAmount || 0);
        const rate = parseFloat(assetRate || 0);
        finalBalance = amt * rate;
        
        finalAssetData = {
          assetType,
          assetAmount: amt,
          assetRate: rate
        };
      } else {
        finalAssetData = { assetType: 'TL' };
      }
    }

    const accountData = {
      name,
      type,
      balance: finalBalance,
      ...finalAssetData
    };

    if (accountToEdit) {
      editAccount(accountToEdit.id, accountData);
    } else {
      addAccount(accountData);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 200 }}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{accountToEdit ? 'Hesabı Düzenle' : 'Yeni Hesap Ekle'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="form-group">
            <label className="form-label">Hesap Türü</label>
            <select value={type} onChange={e => setType(e.target.value)} className="form-input font-bold" required>
              <option value="bank">Banka Hesabı</option>
              <option value="credit_card">Kredi Kartı</option>
              <option value="cash">Nakit Kasa</option>
              <option value="investment">Yatırım / Birikim (Altın, Döviz)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Hesap Adı</label>
            <input 
              type="text" 
              placeholder="Örn: Garanti Bankası, Evdeki Nakit" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="form-input" 
              required 
            />
          </div>

          {type === 'investment' ? (
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)' }}>
              <div className="form-group mb-3">
                <label className="form-label text-primary">Varlık Cinsi</label>
                <select value={assetType} onChange={e => setAssetType(e.target.value)} className="form-input font-bold text-primary">
                  <option value="TL">Türk Lirası (₺)</option>
                  <option value="ALTIN">Altın (Gram)</option>
                  <option value="USD">Dolar ($)</option>
                  <option value="EUR">Euro (€)</option>
                  <option value="GUMUS">Gümüş (Gram)</option>
                </select>
              </div>

              {assetType !== 'TL' ? (
                <div className="flex gap-3">
                  <div className="form-group flex-1">
                    <label className="form-label">Miktar</label>
                    <input 
                      type="number" 
                      step="0.01"
                      placeholder="Örn: 50" 
                      value={assetAmount} 
                      onChange={e => setAssetAmount(e.target.value)} 
                      className="form-input font-bold text-lg" 
                      required
                    />
                  </div>
                  <div className="form-group flex-1">
                    <label className="form-label">Birim Fiyatı / Kur (₺)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      placeholder="Örn: 2500" 
                      value={assetRate} 
                      onChange={e => setAssetRate(e.target.value)} 
                      className="form-input font-bold text-lg" 
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Mevcut Bakiye (₺)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00" 
                    value={balance} 
                    onChange={e => setBalance(e.target.value)} 
                    className="form-input text-lg font-bold" 
                    required
                  />
                </div>
              )}
              
              {assetType !== 'TL' && assetAmount && assetRate && (
                <p className="text-xs text-muted mt-3 text-right">
                  Toplam Değer: <strong className="text-success">{new Intl.NumberFormat('tr-TR', {style:'currency', currency:'TRY'}).format(parseFloat(assetAmount) * parseFloat(assetRate))}</strong>
                </p>
              )}
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">Mevcut Bakiye (₺)</label>
              <input 
                type="number" 
                step="0.01"
                placeholder="0.00" 
                value={balance} 
                onChange={e => setBalance(e.target.value)} 
                className="form-input text-lg font-bold" 
                required
              />
              {type === 'credit_card' && (
                <p className="text-xs text-muted mt-1">Kredi kartı ekliyorsanız güncel borcunuzu eksi (-) değer olarak girebilirsiniz.</p>
              )}
            </div>
          )}

          <button type="submit" className="btn btn-primary mt-2">
            Kaydet
          </button>
        </form>
      </div>
    </div>
  );
};

export default AccountForm;
