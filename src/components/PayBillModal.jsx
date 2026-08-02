import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useBudget } from '../context/BudgetContext';

const PayBillModal = ({ bill, onClose }) => {
  const { accounts, markBillAsPaid, getEstimatedBillAmount } = useBudget();
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedAmount, setEstimatedAmount] = useState(0);

  useEffect(() => {
    if (bill) {
      const est = getEstimatedBillAmount(bill);
      setEstimatedAmount(est);
      setAmount(est > 0 ? est.toFixed(2) : '');
      setAccountId(bill.defaultAccountId || (accounts.length > 0 ? accounts[0].id : ''));
      setDescription(`${bill.name} Ödemesi`);
    }
  }, [bill, accounts]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !accountId) return;

    markBillAsPaid(bill.id, amount, accountId, description);

    onClose();
  };

  if (!bill) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Faturayı Öde</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          <div className="p-3 rounded-lg text-center" style={{ backgroundColor: 'var(--bg-color)' }}>
            <p className="font-bold text-lg">{bill.name}</p>
            <p className="text-xs text-muted">Tahmini veya Sabit Tutar: {new Intl.NumberFormat('tr-TR', {style:'currency', currency:'TRY'}).format(estimatedAmount)}</p>
          </div>

          <div className="form-group">
            <label className="form-label">Gerçekleşen Ödeme Tutarı (₺)</label>
            <input 
              type="number" 
              step="0.01"
              value={amount} 
              onChange={e => setAmount(e.target.value)} 
              className="form-input text-lg font-bold text-danger" 
              required 
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Hangi Hesaptan / Karttan Ödendi?</label>
            <select 
              value={accountId} 
              onChange={e => setAccountId(e.target.value)} 
              className="form-input"
              required
            >
              <option value="">Seçiniz</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.type === 'bank' ? 'Banka' : acc.type === 'credit_card' ? 'Kredi Kartı' : 'Diğer'})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Açıklama</label>
            <input 
              type="text" 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              className="form-input" 
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary mt-2">
            Ödemeyi Tamamla
          </button>
        </form>
      </div>
    </div>
  );
};

export default PayBillModal;
