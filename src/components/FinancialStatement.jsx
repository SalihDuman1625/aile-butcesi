import React, { useEffect, useState } from 'react';
import { X, Printer, FileText, List } from 'lucide-react';
import { openFinancialPdf } from '../utils/pdfExport';
import { useBudget } from '../context/BudgetContext';

const FinancialStatement = ({ onClose, dateRange, filteredTransactions }) => {
  const { accounts, getDebts, getAccountBalances } = useBudget();
  const [isDetailed, setIsDetailed] = useState(false);
  
  const activeDebts = getDebts();
  const { totalCashAndBank, totalCCDebt, totalInvestments } = getAccountBalances();

  useEffect(() => {
    document.body.classList.add('printing-modal');
    return () => document.body.classList.remove('printing-modal');
  }, []);

  // Balance calculations
  let sumReceivables = 0;
  let sumPayables = 0;
  const receivablesDetail = [];
  const payablesDetail = [];
  
  activeDebts.forEach(d => {
    if (d.netAmount > 0) {
      sumReceivables += d.netAmount;
      receivablesDetail.push({ name: d.person, amount: d.netAmount, assets: d.assets });
    }
    if (d.netAmount < 0) {
      sumPayables += Math.abs(d.netAmount);
      payablesDetail.push({ name: d.person, amount: Math.abs(d.netAmount), assets: d.assets });
    }
  });

  const totalAssets = totalCashAndBank + totalInvestments + sumReceivables;
  const totalLiabilities = Math.abs(totalCCDebt) + sumPayables;
  const equity = totalAssets - totalLiabilities;

  // Account details
  const cashAndBankAccounts = accounts.filter(a => a.type === 'bank' || a.type === 'cash');
  const investmentAccounts = accounts.filter(a => a.type === 'investment');
  const creditCardAccounts = accounts.filter(a => a.type === 'credit_card');

  // Income & Expense calculations
  let periodIncome = 0;
  let periodExpense = 0;
  
  const incomeByCategory = {};
  const expenseByCategory = {};

  filteredTransactions.forEach(t => {
    if (t.type === 'income') {
      const amt = parseFloat(t.amount);
      periodIncome += amt;
      const cat = t.category || 'Diğer';
      incomeByCategory[cat] = (incomeByCategory[cat] || 0) + amt;
    }
    if (t.type === 'expense') {
      const amt = parseFloat(t.amount);
      periodExpense += amt;
      const cat = t.category || 'Diğer';
      expenseByCategory[cat] = (expenseByCategory[cat] || 0) + amt;
    }
  });
  
  const periodNetIncome = periodIncome - periodExpense;

  const formatMoney = (val) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val);

  const handlePrint = (detailed) => {
    setIsDetailed(detailed);
    
    const data = {
      totalCashAndBank, 
      cashAndBankAccounts: cashAndBankAccounts.map(a => ({ name: a.name, amount: parseFloat(a.balance || 0) })),
      totalInvestments, 
      investmentAccounts: investmentAccounts.map(a => ({ name: a.name, amount: parseFloat(a.balance || 0) })),
      sumReceivables, 
      receivablesDetail,
      totalAssets,
      totalCCDebt, 
      creditCardAccounts: creditCardAccounts.map(a => ({ name: a.name, amount: Math.abs(parseFloat(a.balance || 0)) })),
      sumPayables, 
      payablesDetail,
      totalLiabilities,
      equity,
      periodIncome, 
      incomeByCategory,
      periodExpense, 
      expenseByCategory,
      periodNetIncome
    };
    
    openFinancialPdf(detailed, dateRange, data);
  };

  return (
    <div className="modal-overlay print-overlay" onClick={onClose} style={{ zIndex: 200, alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '950px', width: '100%', borderRadius: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
        
        <div className="flex justify-between items-start mb-6 border-b border-[var(--border-color)] pb-4 hide-on-print">
          <div>
            <h2 className="text-2xl font-bold text-main">Bilanço ve Gelir Tablosu</h2>
            <p className="text-muted mt-1">Finansal Rapor</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={24} />
          </button>
        </div>

        <div className="flex gap-2 mb-6 hide-on-print flex-col sm:flex-row">
          <button onClick={() => setIsDetailed(!isDetailed)} className="btn flex-1 flex items-center justify-center gap-2" style={{ padding: '0.75rem', backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1' }}>
            {isDetailed ? <FileText size={18} /> : <List size={18} />} 
            Görünüm: {isDetailed ? 'Detaylı (Tüm Kalemler)' : 'Özet (Ana Başlıklar)'}
          </button>
          
          <button onClick={() => handlePrint(false)} className="btn flex-1 flex items-center justify-center gap-2" style={{ padding: '0.75rem', backgroundColor: '#2563EB', color: 'white' }}>
            <Printer size={18} /> Özet PDF
          </button>
          
          <button onClick={() => handlePrint(true)} className="btn flex-1 flex items-center justify-center gap-2" style={{ padding: '0.75rem', backgroundColor: '#0f172a', color: 'white' }}>
            <Printer size={18} /> Detaylı PDF
          </button>
        </div>

        <div className="print-only-container">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold uppercase mb-1">{isDetailed ? 'Detaylı Finansal Rapor' : 'Özet Finansal Rapor'}</h1>
            <p className="text-muted">Rapor Tarihi: {new Date().toLocaleDateString('tr-TR')}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 print-grid-2 gap-8">
            {/* BİLANÇO */}
            <div>
              <h3 className="text-lg font-bold mb-4 border-b pb-2 text-primary uppercase">Bilanço (Mevcut Durum)</h3>
              
              <div className="mb-4">
                <h4 className="font-bold text-sm text-muted mb-2 uppercase">Varlıklar (Aktif)</h4>
                
                {/* Nakit ve Bankalar */}
                <div className={`flex justify-between py-1 ${!isDetailed ? 'border-b border-gray-100' : 'text-primary font-medium'}`}>
                  <span className="text-sm">Nakit ve Bankalar</span>
                  <span className={!isDetailed ? "font-medium" : ""}>{formatMoney(totalCashAndBank)}</span>
                </div>
                {isDetailed && cashAndBankAccounts.map(a => (
                  <div key={a.id} className="flex justify-between py-1 pl-4 text-xs text-muted border-b border-gray-100">
                    <span>{a.name}</span>
                    <span>{formatMoney(a.balance)}</span>
                  </div>
                ))}

                {/* Birikimler */}
                <div className={`flex justify-between py-1 mt-2 ${!isDetailed ? 'border-b border-gray-100' : 'text-primary font-medium'}`}>
                  <span className="text-sm">Birikimler ve Yatırımlar</span>
                  <span className={!isDetailed ? "font-medium" : ""}>{formatMoney(totalInvestments)}</span>
                </div>
                {isDetailed && investmentAccounts.map(a => (
                  <div key={a.id} className="flex justify-between py-1 pl-4 text-xs text-muted border-b border-gray-100">
                    <span>{a.name}</span>
                    <span>{formatMoney(a.balance)}</span>
                  </div>
                ))}

                {/* Alacaklar */}
                <div className={`flex justify-between py-1 mt-2 ${!isDetailed ? 'border-b border-gray-100' : 'text-primary font-medium'}`}>
                  <span className="text-sm">Alacaklar (Cari)</span>
                  <span className={!isDetailed ? "font-medium text-success" : ""}>{formatMoney(sumReceivables)}</span>
                </div>
                {isDetailed && receivablesDetail.map(r => (
                  <div key={r.name} className="flex justify-between py-1 pl-4 text-xs text-muted border-b border-gray-100">
                    <span>
                      {r.name}
                      {r.assets && Object.keys(r.assets).some(a => a !== 'TL' && Math.abs(r.assets[a]) > 0.001) && (
                        <span className="ml-2 text-[10px] text-primary">
                          ({Object.keys(r.assets).filter(a => a !== 'TL' && Math.abs(r.assets[a]) > 0.001).map(a => `${r.assets[a] > 0 ? '+' : ''}${r.assets[a]} ${a}`).join(', ')})
                        </span>
                      )}
                    </span>
                    <span>{formatMoney(r.amount)}</span>
                  </div>
                ))}

                <div className="flex justify-between py-2 mt-3 bg-gray-50 font-bold px-2 rounded">
                  <span className="text-sm">Toplam Varlıklar</span>
                  <span className="text-primary">{formatMoney(totalAssets)}</span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-bold text-sm text-muted mb-2 mt-6 uppercase">Yükümlülükler (Pasif)</h4>
                
                {/* Kredi Kartları */}
                <div className={`flex justify-between py-1 ${!isDetailed ? 'border-b border-gray-100' : 'text-danger font-medium'}`}>
                  <span className="text-sm">Kredi Kartı Borçları</span>
                  <span className={!isDetailed ? "font-medium" : ""}>{formatMoney(Math.abs(totalCCDebt))}</span>
                </div>
                {isDetailed && creditCardAccounts.map(a => (
                  <div key={a.id} className="flex justify-between py-1 pl-4 text-xs text-muted border-b border-gray-100">
                    <span>{a.name}</span>
                    <span>{formatMoney(Math.abs(a.balance))}</span>
                  </div>
                ))}

                {/* Borçlar */}
                <div className={`flex justify-between py-1 mt-2 ${!isDetailed ? 'border-b border-gray-100' : 'text-danger font-medium'}`}>
                  <span className="text-sm">Borçlar (Cari)</span>
                  <span className={!isDetailed ? "font-medium text-danger" : ""}>{formatMoney(sumPayables)}</span>
                </div>
                {isDetailed && payablesDetail.map(p => (
                  <div key={p.name} className="flex justify-between py-1 pl-4 text-xs text-muted border-b border-gray-100">
                    <span>
                      {p.name}
                      {p.assets && Object.keys(p.assets).some(a => a !== 'TL' && Math.abs(p.assets[a]) > 0.001) && (
                        <span className="ml-2 text-[10px] text-primary">
                          ({Object.keys(p.assets).filter(a => a !== 'TL' && Math.abs(p.assets[a]) > 0.001).map(a => `${p.assets[a] < 0 ? '' : '+'}${p.assets[a]} ${a}`).join(', ')})
                        </span>
                      )}
                    </span>
                    <span>{formatMoney(p.amount)}</span>
                  </div>
                ))}

                <div className="flex justify-between py-2 mt-3 bg-gray-50 font-bold px-2 rounded">
                  <span className="text-sm">Toplam Yükümlülükler</span>
                  <span className="text-danger">{formatMoney(totalLiabilities)}</span>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-bold text-sm text-muted mb-2 uppercase">Özkaynaklar</h4>
                <div className="flex justify-between py-2 bg-blue-50 text-blue-900 font-bold px-2 rounded">
                  <span className="text-sm">Net Varlık (Özkaynak)</span>
                  <span>{formatMoney(equity)}</span>
                </div>
              </div>
            </div>

            {/* GELİR TABLOSU */}
            <div>
              <h3 className="text-lg font-bold mb-4 border-b pb-2 text-success uppercase">Gelir Tablosu ({dateRange})</h3>
              
              <div className="mb-4">
                <h4 className="font-bold text-sm text-muted mb-2 uppercase">Gelirler</h4>
                <div className={`flex justify-between py-1 ${!isDetailed ? 'border-b border-gray-100' : 'text-success font-medium'}`}>
                  <span className="text-sm">Faaliyet Gelirleri</span>
                  <span className={!isDetailed ? "font-medium text-success" : ""}>{formatMoney(periodIncome)}</span>
                </div>
                
                {isDetailed && Object.entries(incomeByCategory).sort((a,b) => b[1]-a[1]).map(([cat, amt]) => (
                  <div key={cat} className="flex justify-between py-1 pl-4 text-xs text-muted border-b border-gray-100">
                    <span>{cat}</span>
                    <span>{formatMoney(amt)}</span>
                  </div>
                ))}

                <div className="flex justify-between py-2 mt-3 bg-gray-50 font-bold px-2 rounded">
                  <span className="text-sm">Toplam Gelirler</span>
                  <span className="text-success">{formatMoney(periodIncome)}</span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-bold text-sm text-muted mb-2 mt-6 uppercase">Giderler</h4>
                <div className={`flex justify-between py-1 ${!isDetailed ? 'border-b border-gray-100' : 'text-danger font-medium'}`}>
                  <span className="text-sm">Faaliyet Giderleri</span>
                  <span className={!isDetailed ? "font-medium text-danger" : ""}>{formatMoney(periodExpense)}</span>
                </div>
                
                {isDetailed && Object.entries(expenseByCategory).sort((a,b) => b[1]-a[1]).map(([cat, amt]) => (
                  <div key={cat} className="flex justify-between py-1 pl-4 text-xs text-muted border-b border-gray-100">
                    <span>{cat}</span>
                    <span>{formatMoney(amt)}</span>
                  </div>
                ))}

                <div className="flex justify-between py-2 mt-3 bg-gray-50 font-bold px-2 rounded">
                  <span className="text-sm">Toplam Giderler</span>
                  <span className="text-danger">{formatMoney(periodExpense)}</span>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-bold text-sm text-muted mb-2 uppercase">Sonuç</h4>
                <div className={`flex justify-between py-2 font-bold px-2 rounded ${periodNetIncome >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  <span className="text-sm">{periodNetIncome >= 0 ? 'Net Kar' : 'Net Zarar'}</span>
                  <span>{formatMoney(periodNetIncome)}</span>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-gray-50 rounded-lg text-xs text-muted leading-relaxed">
                <strong>Not:</strong> Bilanço tablosu güncel anlık durumu (kasa, banka, toplam alacak/borç) yansıtırken; Gelir tablosu sadece seçili olan <strong>"{dateRange}"</strong> dönemi içindeki gelir ve gider işlemlerini kapsar. Borç alıp verme işlemleri gelir tablosuna dahil edilmez, bilançoda (Cari) gösterilir.
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialStatement;
