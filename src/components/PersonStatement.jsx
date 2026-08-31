import React, { useState, useMemo } from 'react';
import { useBudget } from '../context/BudgetContext';
import { X, ArrowUpCircle, ArrowDownCircle, Info, Calendar } from 'lucide-react';

const PersonStatement = ({ personData, onClose, onOpenForm }) => {
  const { transactions } = useBudget();
  
  // O kişiye ait işlemleri kronolojik sıraya göre listele (Yeniden eskiye)
  const accountTransactions = useMemo(() => {
    return transactions
      .filter(t => t.person === personData.person)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, personData.person]);

  const formatMoney = (amount) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(Math.abs(amount));

  // Borç vadesi kontrolü (Gecikmiş borçları kırmızı yapmak için)
  const isOverdue = useMemo(() => {
    if (personData.latestDueDate) {
      const today = new Date();
      today.setHours(0,0,0,0);
      const dueDate = new Date(personData.latestDueDate);
      return dueDate < today && Math.abs(personData.netAmount) > 0.01;
    }
    return false;
  }, [personData]);

  const handleAddCollection = () => {
    // Alacaklıyız, tahsilat yapıyoruz
    onOpenForm(null, { type: 'debt_collection', person: personData.person });
    onClose();
  };

  const handleAddPayment = () => {
    // Borçluyuz, ödeme yapıyoruz
    onOpenForm(null, { type: 'debt_payment', person: personData.person });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 100 }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '95%' }}>
        <div className="flex justify-between items-start mb-6 border-b border-[var(--border-color)] pb-4">
          <div>
            <h2 className="text-2xl font-bold text-main">{personData.person} <span className="text-sm font-normal text-muted">- Cari Ekstre</span></h2>
            
            <div className={`mt-2 flex items-center gap-2 p-2 rounded-lg inline-flex ${personData.netAmount > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              <span className="font-bold text-xl">
                {personData.netAmount > 0 ? '+' : '-'}{formatMoney(personData.netAmount)}
              </span>
              <span className="text-sm font-semibold uppercase tracking-wider">
                {personData.netAmount > 0 ? '(Alacağımız Var)' : '(Borcumuz Var)'}
              </span>
            </div>

            {personData.latestDueDate && (
              <div className={`mt-2 text-sm flex items-center gap-1 font-semibold ${isOverdue ? 'text-red-600' : 'text-muted'}`}>
                <Calendar size={14} /> Yaklaşan/Geçen Vade: {new Date(personData.latestDueDate).toLocaleDateString('tr-TR')}
                {isOverdue && ' (GECİKMİŞ!)'}
              </div>
            )}
          </div>
          <button onClick={onClose} className="p-2 text-muted hover:text-main rounded-full bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <button 
            onClick={handleAddCollection}
            className="flex-1 py-2 px-3 flex items-center justify-center gap-2 rounded-lg font-bold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#10b981' }} // Yeşil
          >
            <ArrowDownCircle size={18} /> Tahsilat Yap
          </button>
          
          <button 
            onClick={handleAddPayment}
            className="flex-1 py-2 px-3 flex items-center justify-center gap-2 rounded-lg font-bold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#ef4444' }} // Kırmızı
          >
            <ArrowUpCircle size={18} /> Ödeme Yap
          </button>
        </div>

        <div className="mt-6">
          <h3 className="font-bold text-main mb-3">Hesap Hareketleri</h3>
          
          {accountTransactions.length === 0 ? (
            <p className="text-center text-muted py-4">Bu kişiye ait hiçbir işlem bulunamadı.</p>
          ) : (
            <div className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto pr-2">
              {accountTransactions.map(t => {
                // Determine styling and sign based on type
                let typeLabel = '';
                let isPositive = false;
                
                if (t.type === 'debt_given') { typeLabel = 'Borç Verildi'; isPositive = true; } // Bize borçlandı
                else if (t.type === 'debt_taken') { typeLabel = 'Borç Alındı'; isPositive = false; } // Biz borçlandık
                else if (t.type === 'debt_collection') { typeLabel = 'Tahsilat'; isPositive = false; } // Borcunu ödedi (Bakiyesi düştü)
                else if (t.type === 'debt_payment') { typeLabel = 'Ödeme Yapıldı'; isPositive = true; } // Borcumuzu ödedik (Bakiyesi arttı)
                else if (t.type === 'expense') { typeLabel = 'Gider'; isPositive = false; } // Normal harcama
                else if (t.type === 'income') { typeLabel = 'Gelir'; isPositive = true; } // Normal gelir

                return (
                  <div key={t.id} className="flex justify-between items-center p-3 rounded-lg border border-[var(--border-color)]" style={{ backgroundColor: 'var(--card-bg)' }}>
                    <div>
                      <p className="font-bold text-main">{t.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted mt-1">
                        <span>{new Date(t.date).toLocaleDateString('tr-TR')}</span>
                        <span>•</span>
                        <span className="font-semibold">{typeLabel}</span>
                        {t.dueDate && (
                          <>
                            <span>•</span>
                            <span className="text-orange-500">Vade: {new Date(t.dueDate).toLocaleDateString('tr-TR')}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? '+' : '-'}{formatMoney(t.amount)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonStatement;
