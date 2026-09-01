import React, { useMemo, useEffect } from 'react';
import { useBudget } from '../context/BudgetContext';
import { X, TrendingDown, TrendingUp, Edit2, Trash2 } from 'lucide-react';

const IncomeExpenseStatement = ({ type, monthIndex, year, onClose, onOpenForm }) => {
  const { transactions, deleteTransaction, currentUser } = useBudget();
  
  useEffect(() => {
    document.body.classList.add('printing-modal');
    return () => document.body.classList.remove('printing-modal');
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => {
        if (t.type !== type) return false;
        const d = new Date(t.date);
        return d.getMonth() === monthIndex && d.getFullYear() === year;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, type, monthIndex, year]);

  const totalAmount = filteredTransactions.reduce((acc, t) => acc + t.amount, 0);
  const formatMoney = (amount) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);

  const title = type === 'income' ? 'Bu Ayki Gelirler' : 'Bu Ayki Giderler';
  const subtitle = new Date(year, monthIndex).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

  return (
    <div className="modal-overlay z-[999] print-overlay flex items-center justify-center p-4">
      <div className="modal-content w-full max-w-2xl bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10" style={{ borderRadius: '1rem 1rem 0 0' }}>
          <div>
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="text-sm text-muted mt-1">{subtitle}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors hide-charts-on-print">
            <X size={20} className="text-muted" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Ozet Kartı */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100 print-only-container">
            <p className="text-sm text-muted mb-1">Toplam {type === 'income' ? 'Gelir' : 'Gider'}</p>
            <p className="text-3xl font-bold text-main">{formatMoney(totalAmount)}</p>
          </div>

          <h3 className="font-bold text-lg mb-4 text-main px-1">İşlem Detayları ({filteredTransactions.length})</h3>
          
          <div className="flex flex-col gap-3">
            {filteredTransactions.length === 0 ? (
              <p className="text-center text-muted py-8 bg-gray-50 rounded-xl border border-dashed">Bu dönemde {type === 'income' ? 'gelir' : 'gider'} kaydı bulunmuyor.</p>
            ) : (
              filteredTransactions.map(t => (
                <div key={t.id} className="card p-3 flex justify-between items-center" style={{ border: 'none', backgroundColor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div className="flex gap-3 items-center">
                    <div className={`p-2 rounded-full ${type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {type === 'income' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-main">{t.title}</p>
                      <p className="text-xs text-muted">{new Date(t.date).toLocaleDateString('tr-TR')} • {t.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className={`font-bold text-sm ${type === 'income' ? 'text-success' : 'text-main'}`}>
                        {type === 'income' ? '+' : '-'}{formatMoney(t.amount)}
                      </p>
                    </div>
                    {(currentUser?.role === 'admin' || t.addedBy === currentUser?.id) && (
                      <>
                        <button onClick={() => onOpenForm && onOpenForm(t)} className="text-muted ml-2 hover:text-primary hide-charts-on-print" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => deleteTransaction(t.id)} className="text-danger ml-1 hover:text-red-700 hide-charts-on-print" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomeExpenseStatement;
