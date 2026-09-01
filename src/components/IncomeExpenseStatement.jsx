import React, { useMemo, useEffect, useState } from 'react';
import { openPdfTable } from '../utils/pdfExport';
import { useBudget } from '../context/BudgetContext';
import { X, TrendingDown, TrendingUp, Edit2, Trash2, Download, Printer } from 'lucide-react';

const IncomeExpenseStatement = ({ type, monthIndex, year, onClose, onOpenForm }) => {
    const [dateRange, setDateRange] = useState('Bu Ay');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { transactions, deleteTransaction, currentUser } = useBudget();
  
  useEffect(() => {
    document.body.classList.add('printing-modal');
  
  const exportToExcel = () => {
    let csvContent = "\uFEFF";
    csvContent += "Tarih;Islem;Kategori;Tutar\n";
    filteredTransactions.forEach(t => {
      const d = new Date(t.date).toLocaleDateString('tr-TR');
      const title = (t.title || '').replace(/;/g, ',');
      const cat = (t.category || '').replace(/;/g, ',');
      const amt = t.amount;
      csvContent += `${d};${title};${cat};${amt}\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GelirGider_${new Date().toLocaleDateString('tr-TR')}.csv`;
    link.click();
  };

  return () => document.body.classList.remove('printing-modal');
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (t.type !== type) return false;
      
      const tDate = new Date(t.date);
      const now = new Date();
      if (dateRange === 'Bu Ay') {
        if (tDate.getMonth() !== now.getMonth() || tDate.getFullYear() !== now.getFullYear()) return false;
      } else if (dateRange === 'Geçen Ay') {
        const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        if (tDate.getMonth() !== lastMonth || tDate.getFullYear() !== year) return false;
      } else if (dateRange === 'Bu Yıl') {
        if (tDate.getFullYear() !== now.getFullYear()) return false;
      } else if (dateRange === 'Özel') {
        if (startDate) {
          const s = new Date(startDate);
          s.setHours(0,0,0,0);
          if (tDate < s) return false;
        }
        if (endDate) {
          const e = new Date(endDate);
          e.setHours(23,59,59,999);
          if (tDate > e) return false;
        }
      }
      return true;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, type, dateRange, startDate, endDate]);

  const totalAmount = filteredTransactions.reduce((acc, t) => acc + t.amount, 0);
  const formatMoney = (amount) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);

  


  const exportToExcel = () => {
    let csvContent = "\uFEFF";
    csvContent += "Tarih;Islem;Kategori;Tutar\n";
    filteredTransactions.forEach(t => {
      const d = new Date(t.date).toLocaleDateString('tr-TR');
      const title = (t.title || '').replace(/;/g, ',');
      const cat = (t.category || '').replace(/;/g, ',');
      const amt = t.amount;
      csvContent += `${d};${title};${cat};${amt}\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GelirGider_${new Date().toLocaleDateString('tr-TR')}.csv`;
    link.click();
  };

  return (
    <div className="modal-overlay z-[999] print-overlay flex items-center justify-center p-4">
      <div className="modal-content w-full max-w-2xl bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10" style={{ borderRadius: '1rem 1rem 0 0' }}>
          <div>
            <h2 className="text-xl font-bold">{type === 'income' ? 'Gelirler' : 'Giderler'}</h2>
            <div className="flex flex-col md:flex-row gap-2 mt-2 hide-charts-on-print">
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="border border-gray-300 rounded-md p-1 text-sm bg-white"
              >
                <option value="Bu Ay">Bu Ay</option>
                <option value="Geçen Ay">Geçen Ay</option>
                <option value="Bu Yıl">Bu Yıl</option>
                <option value="Tüm Zamanlar">Tüm Zamanlar</option>
                <option value="Özel">Özel Tarih Aralığı</option>
              </select>
              
              {dateRange === 'Özel' && (
                <div className="flex gap-2 items-center">
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border border-gray-300 rounded-md p-1 text-sm bg-white" />
                  <span className="text-xs text-muted">-</span>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border border-gray-300 rounded-md p-1 text-sm bg-white" />
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-2 items-center hide-charts-on-print">
            <button onClick={exportToExcel} title="Excel İndir" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-success">
              <Download size={20} />
            </button>
            <button onClick={() => {
const totalAmountCalc = filteredTransactions.reduce((acc, t) => acc + t.amount, 0);
openPdfTable('Gelir/Gider Raporu', filteredTransactions, totalAmountCalc);
}} title="Yazdır / PDF Al" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-primary">
              <Printer size={20} />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors  ">
            <X size={20} className="text-muted" />
          </button>
          </div>

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
                        <button onClick={() => onOpenForm && onOpenForm(t)} className="hide-on-print text-muted ml-2 hover:text-primary hide-charts-on-print" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => deleteTransaction(t.id)} className="hide-on-print text-danger ml-1 hover:text-red-700 hide-charts-on-print" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {filteredTransactions.length > 0 && (
            <div className="mt-4 p-4 rounded-lg bg-gray-50 flex justify-between items-center border border-gray-200 print-only" style={{ display: 'none' }}>
              <span className="font-bold text-gray-700">Seçili Dönem Toplamı:</span>
              <span className="font-bold text-xl text-primary">{formatMoney(totalAmount)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IncomeExpenseStatement;
