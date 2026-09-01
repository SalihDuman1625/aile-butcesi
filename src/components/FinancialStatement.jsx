import React from 'react';
import { X, Printer } from 'lucide-react';
import { useBudget } from '../context/BudgetContext';

const FinancialStatement = ({ onClose, dateRange, filteredTransactions }) => {
  const { getDebts, getAccountBalances } = useBudget();
  const activeDebts = getDebts();
  const { totalCashAndBank, totalCCDebt, totalInvestments } = getAccountBalances();

  let sumReceivables = 0;
  let sumPayables = 0;
  activeDebts.forEach(d => {
    if (d.netAmount > 0) sumReceivables += d.netAmount;
    if (d.netAmount < 0) sumPayables += Math.abs(d.netAmount);
  });

  const totalAssets = totalCashAndBank + totalInvestments + sumReceivables;
  const totalLiabilities = Math.abs(totalCCDebt) + sumPayables;
  const equity = totalAssets - totalLiabilities;

  let periodIncome = 0;
  let periodExpense = 0;
  
  filteredTransactions.forEach(t => {
    if (t.type === 'income') periodIncome += parseFloat(t.amount);
    if (t.type === 'expense') periodExpense += parseFloat(t.amount);
  });
  
  const periodNetIncome = periodIncome - periodExpense;

  const formatMoney = (val) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay print-overlay" onClick={onClose} style={{ zIndex: 200, alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '850px', width: '100%', borderRadius: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
        
        <div className="flex justify-between items-start mb-6 border-b border-[var(--border-color)] pb-4 hide-on-print">
          <div>
            <h2 className="text-2xl font-bold text-main">Bilanço ve Gelir Tablosu</h2>
            <p className="text-muted mt-1">Özet Finansal Rapor</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={24} />
          </button>
        </div>

        <div className="flex gap-2 mb-6 hide-on-print">
          <button onClick={handlePrint} className="btn flex-1 flex items-center justify-center gap-2" style={{ padding: '0.75rem', backgroundColor: '#2563EB', color: 'white' }}>
            <Printer size={18} /> PDF Olarak Kaydet / Yazdır
          </button>
        </div>

        <div className="print-only-container">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold uppercase mb-1">Özet Finansal Rapor</h1>
            <p className="text-muted">Rapor Tarihi: {new Date().toLocaleDateString('tr-TR')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* BİLANÇO */}
            <div>
              <h3 className="text-lg font-bold mb-4 border-b pb-2 text-primary uppercase">Bilanço (Mevcut Durum)</h3>
              
              <div className="mb-4">
                <h4 className="font-bold text-sm text-muted mb-2 uppercase">Varlıklar (Aktif)</h4>
                <div className="flex justify-between py-1 border-b border-gray-100"><span className="text-sm">Nakit ve Bankalar</span><span className="font-medium">{formatMoney(totalCashAndBank)}</span></div>
                <div className="flex justify-between py-1 border-b border-gray-100"><span className="text-sm">Birikimler ve Yatırımlar</span><span className="font-medium">{formatMoney(totalInvestments)}</span></div>
                <div className="flex justify-between py-1 border-b border-gray-100"><span className="text-sm">Alacaklar (Cari)</span><span className="font-medium text-success">{formatMoney(sumReceivables)}</span></div>
                <div className="flex justify-between py-2 mt-2 bg-gray-50 font-bold px-2 rounded"><span className="text-sm">Toplam Varlıklar</span><span className="text-primary">{formatMoney(totalAssets)}</span></div>
              </div>

              <div className="mb-4">
                <h4 className="font-bold text-sm text-muted mb-2 uppercase">Yükümlülükler (Pasif)</h4>
                <div className="flex justify-between py-1 border-b border-gray-100"><span className="text-sm">Kredi Kartı Borçları</span><span className="font-medium">{formatMoney(Math.abs(totalCCDebt))}</span></div>
                <div className="flex justify-between py-1 border-b border-gray-100"><span className="text-sm">Borçlar (Cari)</span><span className="font-medium text-danger">{formatMoney(sumPayables)}</span></div>
                <div className="flex justify-between py-2 mt-2 bg-gray-50 font-bold px-2 rounded"><span className="text-sm">Toplam Yükümlülükler</span><span className="text-danger">{formatMoney(totalLiabilities)}</span></div>
              </div>

              <div>
                <h4 className="font-bold text-sm text-muted mb-2 uppercase">Özkaynaklar</h4>
                <div className="flex justify-between py-2 bg-blue-50 text-blue-900 font-bold px-2 rounded"><span className="text-sm">Net Varlık (Özkaynak)</span><span>{formatMoney(equity)}</span></div>
              </div>
            </div>

            {/* GELİR TABLOSU */}
            <div>
              <h3 className="text-lg font-bold mb-4 border-b pb-2 text-success uppercase">Gelir Tablosu ({dateRange})</h3>
              
              <div className="mb-4">
                <h4 className="font-bold text-sm text-muted mb-2 uppercase">Gelirler</h4>
                <div className="flex justify-between py-1 border-b border-gray-100"><span className="text-sm">Faaliyet Gelirleri (Maaş vb.)</span><span className="font-medium text-success">{formatMoney(periodIncome)}</span></div>
                <div className="flex justify-between py-2 mt-2 bg-gray-50 font-bold px-2 rounded"><span className="text-sm">Toplam Gelirler</span><span className="text-success">{formatMoney(periodIncome)}</span></div>
              </div>

              <div className="mb-4">
                <h4 className="font-bold text-sm text-muted mb-2 uppercase">Giderler</h4>
                <div className="flex justify-between py-1 border-b border-gray-100"><span className="text-sm">Faaliyet Giderleri (Fatura vb.)</span><span className="font-medium text-danger">{formatMoney(periodExpense)}</span></div>
                <div className="flex justify-between py-2 mt-2 bg-gray-50 font-bold px-2 rounded"><span className="text-sm">Toplam Giderler</span><span className="text-danger">{formatMoney(periodExpense)}</span></div>
              </div>

              <div>
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
