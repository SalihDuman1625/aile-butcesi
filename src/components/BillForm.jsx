import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useBudget } from '../context/BudgetContext';

const BillForm = ({ onClose, billToEdit }) => {
  const { addBill, editBill, accounts } = useBudget();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Fatura');
  const [dueDay, setDueDay] = useState('');
  const [isFixed, setIsFixed] = useState(false);
  const [expectedAmount, setExpectedAmount] = useState('');
  const [defaultAccountId, setDefaultAccountId] = useState('');

  const [isInstallment, setIsInstallment] = useState(false);
  const [installmentCount, setInstallmentCount] = useState(2);
  const [startingInstallment, setStartingInstallment] = useState(1);

  useEffect(() => {
    if (billToEdit) {
      setName(billToEdit.name);
      setCategory(billToEdit.category);
      setDueDay(billToEdit.dueDay);
      setIsFixed(billToEdit.isFixed);
      setExpectedAmount(billToEdit.expectedAmount || '');
      setDefaultAccountId(billToEdit.defaultAccountId || '');
      setIsInstallment(billToEdit.isInstallment || false);
      setInstallmentCount(billToEdit.totalInstallments || 2);
      setStartingInstallment((billToEdit.paidInstallments || 0) + 1);
    } else if (accounts.length > 0) {
      setDefaultAccountId(accounts[0].id);
    }
  }, [billToEdit, accounts]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !dueDay) return;

    const billData = {
      name,
      category,
      dueDay: parseInt(dueDay),
      isFixed,
      expectedAmount: isFixed ? parseFloat(expectedAmount || 0) : 0,
      defaultAccountId,
      isInstallment: isFixed && isInstallment,
      totalInstallments: isFixed && isInstallment ? parseInt(installmentCount) : undefined,
      paidInstallments: isFixed && isInstallment ? parseInt(startingInstallment) - 1 : undefined
    };

    if (billToEdit) {
      editBill(billToEdit.id, billData);
    } else {
      addBill(billData);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{billToEdit ? 'Faturayı Düzenle' : 'Yeni Fatura / Sabit Gider'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="form-group">
            <label className="form-label">Türü / Kategorisi</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="form-input" required>
              <option value="Fatura">Fatura (Elektrik, Su, İnternet)</option>
              <option value="Kira">Kira</option>
              <option value="Kredi Taksidi">Kredi Taksidi</option>
              <option value="Aidat">Aidat</option>
              <option value="Eğitim">Eğitim Taksidi</option>
              <option value="Diğer">Diğer</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Gider Adı</label>
            <input 
              type="text" 
              placeholder="Örn: Elektrik Faturası, Ev Kirası" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="form-input" 
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Her Ayın Hangi Günü Ödeniyor?</label>
            <input 
              type="number" 
              min="1" max="31"
              placeholder="Örn: 15" 
              value={dueDay} 
              onChange={e => setDueDay(e.target.value)} 
              className="form-input" 
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Nereden Ödenecek? (Varsayılan Hesap)</label>
            <select 
              value={defaultAccountId} 
              onChange={e => setDefaultAccountId(e.target.value)} 
              className="form-input"
            >
              <option value="">Seçiniz (İsteğe Bağlı)</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.type === 'bank' ? 'Banka' : acc.type === 'credit_card' ? 'Kredi Kartı' : 'Diğer'})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-color)' }}>
            <label className="flex items-center gap-2 font-bold mb-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={isFixed} 
                onChange={e => setIsFixed(e.target.checked)} 
                style={{ width: '18px', height: '18px' }}
              />
              Tutar Sabit mi? (Kira, Kredi vs.)
            </label>
            
            {isFixed ? (
              <div className="mt-2 flex flex-col gap-4">
                <div>
                  <label className="form-label">Aylık Sabit Tutar (₺)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00" 
                    value={expectedAmount} 
                    onChange={e => setExpectedAmount(e.target.value)} 
                    className="form-input font-bold" 
                    required={isFixed}
                  />
                </div>
                
                <div style={{ backgroundColor: '#F0F9FF', padding: '0.75rem', borderRadius: '8px', border: '1px solid #BAE6FD' }}>
                  <label className="flex items-center gap-2 font-bold mb-2 cursor-pointer text-primary">
                    <input 
                      type="checkbox" 
                      checked={isInstallment} 
                      onChange={e => setIsInstallment(e.target.checked)} 
                      style={{ width: '18px', height: '18px' }}
                    />
                    Bu Bir Taksitli İşlem / Kredi mi?
                  </label>
                  
                  {isInstallment && (
                    <div className="flex gap-4 mt-3">
                      <div style={{ flex: 1 }}>
                        <label className="form-label text-xs">Toplam Taksit Sayısı</label>
                        <input 
                          type="number" 
                          min="2" 
                          max="360"
                          value={installmentCount} 
                          onChange={e => setInstallmentCount(e.target.value)}
                          className="form-input"
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label className="form-label text-xs">Sıradaki Taksit Kaçıncı?</label>
                        <input 
                          type="number" 
                          min="1" 
                          max={installmentCount}
                          value={startingInstallment} 
                          onChange={e => setStartingInstallment(e.target.value)}
                          className="form-input"
                        />
                        <p className="text-[10px] text-muted mt-1">Eski krediyse bulunduğunuz taksiti yazın (Örn: 27)</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted">
                Değişken faturalar (Elektrik, Su) için sistem otomatik olarak geçmiş harcamalarınızın ortalamasını alarak tahminde bulunur.
              </p>
            )}
          </div>

          <button type="submit" className="btn btn-primary mt-2">
            Kaydet
          </button>
        </form>
      </div>
    </div>
  );
};

export default BillForm;
