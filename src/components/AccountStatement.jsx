import React, { useState, useMemo } from 'react';
import { useBudget } from '../context/BudgetContext';
import { X, ShieldAlert, CheckCircle2, TrendingDown, TrendingUp, ArrowRightLeft } from 'lucide-react';

const AccountStatement = ({ account, onClose }) => {
  const { transactions, addTransaction, editAccount } = useBudget();
  const [actualBalance, setActualBalance] = useState('');
  
  // Sadece bu hesaba ait işlemleri (Giren ve Çıkan) kronolojik sıraya göre listele (Yeniden eskiye)
  const accountTransactions = useMemo(() => {
    return transactions
      .filter(t => t.accountId === account.id || t.targetAccountId === account.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, account.id]);

  const appBalance = parseFloat(account.balance || 0);
  const userEnteredBalance = actualBalance ? parseFloat(actualBalance) : null;
  
  const difference = userEnteredBalance !== null ? (userEnteredBalance - appBalance) : 0;
  const isReconciled = userEnteredBalance !== null && Math.abs(difference) < 0.01;

  const formatMoney = (amount) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);

  const handleReconcile = () => {
    if (difference === 0) return;
    
    // Eksik/Fazla bakiye düzeltmesi
    // difference > 0 demek, bankada daha çok para var demek (Uygulamaya göre bizde eksik). Gelir olarak girmeliyiz.
    // difference < 0 demek, bankada daha az para var demek (Uygulamaya göre bizde fazla). Gider olarak girmeliyiz.
    const isIncome = difference > 0;
    
    addTransaction({
      type: isIncome ? 'income' : 'expense',
      title: 'Banka Mutabakat Düzeltmesi',
      amount: Math.abs(difference),
      category: 'Mutabakat',
      date: new Date().toISOString(),
      accountType: 'Ev',
      person: 'Ortak',
      accountId: account.id
    });

    setActualBalance('');
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 100 }}>
      <div className="modal-content w-full h-full max-h-screen md:max-h-[90vh] flex flex-col m-0 md:m-4 rounded-none md:rounded-2xl" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-[var(--border-color)]">
          <div>
            <h2 className="text-xl font-bold">{account.name} Ekstresi</h2>
            <p className="text-sm text-muted">{account.type === 'bank' ? 'Banka Hesabı' : account.type === 'credit_card' ? 'Kredi Kartı' : 'Diğer Hesap'}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500">
            <X size={24} />
          </button>
        </div>

        {/* Mutabakat (Reconciliation) Section */}
        <div className="p-4 bg-[var(--bg-color)] border-b border-[var(--border-color)]">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-xs text-muted mb-1">Uygulamadaki Bakiye</p>
              <p className="text-2xl font-bold">{formatMoney(appBalance)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-primary font-bold mb-1">Gerçek Banka Bakiyesi</p>
              <input 
                type="number"
                step="0.01"
                placeholder="Örn: 14500.50"
                value={actualBalance}
                onChange={e => setActualBalance(e.target.value)}
                className="form-input font-bold text-right text-primary"
                style={{ width: '140px', padding: '0.5rem' }}
              />
            </div>
          </div>

          {userEnteredBalance !== null && (
            <div className={`p-3 rounded-lg flex items-center justify-between ${isReconciled ? 'bg-green-100 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center gap-2">
                {isReconciled ? (
                  <CheckCircle2 className="text-success" size={24} />
                ) : (
                  <ShieldAlert className="text-danger" size={24} />
                )}
                <div>
                  <p className={`font-bold text-sm ${isReconciled ? 'text-success' : 'text-danger'}`}>
                    {isReconciled ? 'Hesap Kuruşu Kuruşuna Tutuyor!' : 'Fark Tespit Edildi'}
                  </p>
                  {!isReconciled && (
                    <p className="text-xs text-danger opacity-80">
                      {difference > 0 ? `Uygulamada ${formatMoney(difference)} Eksik.` : `Uygulamada ${formatMoney(Math.abs(difference))} Fazla.`}
                    </p>
                  )}
                </div>
              </div>
              
              {!isReconciled && (
                <button onClick={handleReconcile} className="btn btn-primary" style={{ backgroundColor: 'var(--danger)', width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
                  Farkı Kapat
                </button>
              )}
            </div>
          )}
        </div>

        {/* Transaction List (Statement) */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          <h3 className="font-bold text-sm text-muted mb-2">Hesap Hareketleri ({accountTransactions.length})</h3>
          
          {accountTransactions.length === 0 ? (
            <p className="text-center text-muted py-8">Bu hesaba ait henüz işlem bulunmuyor.</p>
          ) : (
            accountTransactions.map(t => {
              // İşlem bu hesap için "giren" mi "çıkan" mı tespit et
              let isIncoming = false;
              if (t.type === 'income' || t.type === 'debt_taken') isIncoming = true;
              if (t.type === 'transfer' && t.targetAccountId === account.id) isIncoming = true; // Bize transfer geldi
              
              return (
                <div key={t.id} className="card p-3 flex justify-between items-center" style={{ border: 'none', backgroundColor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div className="flex gap-3 items-center">
                    <div className={`p-2 rounded-full ${isIncoming ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {t.type === 'transfer' ? <ArrowRightLeft size={18} /> : (isIncoming ? <TrendingUp size={18} /> : <TrendingDown size={18} />)}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{t.title}</p>
                      <p className="text-xs text-muted">{new Date(t.date).toLocaleDateString('tr-TR')} • {t.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm ${isIncoming ? 'text-success' : 'text-main'}`}>
                      {isIncoming ? '+' : '-'}{formatMoney(t.amount)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountStatement;
