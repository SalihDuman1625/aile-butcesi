import React, { useState, useMemo, useEffect } from 'react';
import { useBudget } from '../context/BudgetContext';
import { X, ArrowUpCircle, ArrowDownCircle, Printer, Download, Calendar, Edit2, Trash2 } from 'lucide-react';

const PersonStatement = ({ personData, onClose, onOpenForm }) => {
  const { transactions, deleteTransaction, currentUser } = useBudget();
  
  useEffect(() => {
    document.body.classList.add('printing-modal');
  
  const exportToExcel = () => {
    let csvContent = "\uFEFF";
    csvContent += "Tarih;Islem;Kategori;Tutar\n";
    personTransactions.forEach(t => {
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
    link.download = `KisiEkstresi_${new Date().toLocaleDateString('tr-TR')}.csv`;
    link.click();
  };

  return () => document.body.classList.remove('printing-modal');
  }, []);

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

  const handleExportCSV = () => {
    let csv = "Tarih,Islem Turu,Aciklama,Tutar,Vade Tarihi\n";
    accountTransactions.forEach(t => {
      let typeLabel = '';
      let isPositive = false;
      if (t.type === 'debt_given') { typeLabel = 'Borc Verildi'; isPositive = true; }
      else if (t.type === 'debt_taken') { typeLabel = 'Borc Alindi'; isPositive = false; }
      else if (t.type === 'debt_collection') { typeLabel = 'Tahsilat'; isPositive = false; }
      else if (t.type === 'debt_payment') { typeLabel = 'Odeme Yapildi'; isPositive = true; }
      else if (t.type === 'expense') { typeLabel = 'Gider'; isPositive = false; }
      else if (t.type === 'income') { typeLabel = 'Gelir'; isPositive = true; }

      const date = new Date(t.date).toLocaleDateString('tr-TR');
      const dueDate = t.dueDate ? new Date(t.dueDate).toLocaleDateString('tr-TR') : '';
      const amountStr = (isPositive ? '+' : '-') + Math.abs(t.amount).toString();
      
      const safeTitle = `"${(t.title || '').replace(/"/g, '""')}"`;
      
      csv += `${date},${typeLabel},${safeTitle},${amountStr},${dueDate}\n`;
    });

    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${personData.person}_Cari_Ekstre.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=600,width=800');
    let html = `
      <html>
        <head>
          <title>${personData.person} - Cari Ekstre</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            h2 { color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f3f4f6; }
            .positive { color: #16a34a; font-weight: bold; }
            .negative { color: #dc2626; font-weight: bold; }
            .summary { margin-top: 20px; font-size: 1.2rem; font-weight: bold; padding: 15px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; }
          </style>
        </head>
        <body>
          <h2>${personData.person} - Cari Hesap Ekstresi</h2>
          
          <div class="summary">
            Güncel Bakiye: <span class="${personData.netAmount > 0 ? 'positive' : 'negative'}">
              ${personData.netAmount > 0 ? '+' : '-'}${formatMoney(personData.netAmount)}
            </span> 
            (${personData.netAmount > 0 ? 'Alacağımız Var' : 'Borcumuz Var'})
          </div>

          <table>
            <thead>
              <tr>
                <th>Tarih</th>
                <th>İşlem Türü</th>
                <th>Açıklama</th>
                <th>Tutar</th>
                <th>Vade</th>
              </tr>
            </thead>
            <tbody>
    `;

    accountTransactions.forEach(t => {
      let typeLabel = '';
      let isPositive = false;
      if (t.type === 'debt_given') { typeLabel = 'Borç Verildi'; isPositive = true; }
      else if (t.type === 'debt_taken') { typeLabel = 'Borç Alındı'; isPositive = false; }
      else if (t.type === 'debt_collection') { typeLabel = 'Tahsilat'; isPositive = false; }
      else if (t.type === 'debt_payment') { typeLabel = 'Ödeme Yapıldı'; isPositive = true; }
      else if (t.type === 'expense') { typeLabel = 'Gider'; isPositive = false; }
      else if (t.type === 'income') { typeLabel = 'Gelir'; isPositive = true; }

      const date = new Date(t.date).toLocaleDateString('tr-TR');
      const dueDate = t.dueDate ? new Date(t.dueDate).toLocaleDateString('tr-TR') : '-';
      const amountHtml = `<span class="${isPositive ? 'positive' : 'negative'}">${isPositive ? '+' : '-'}${formatMoney(t.amount)}</span>`;

      html += `
        <tr>
          <td>${date}</td>
          <td>${typeLabel}</td>
          <td>${t.title}</td>
          <td>${amountHtml}</td>
          <td>${dueDate}</td>
        </tr>
      `;
    });

    html += `
            </tbody>
          </table>
          <p style="margin-top: 30px; font-size: 0.8rem; color: #6b7280; text-align: center;">
            Bu belge Aile Bütçesi uygulaması tarafından oluşturulmuştur. 
            Oluşturulma Tarihi: ${new Date().toLocaleString('tr-TR')}
          </p>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };


  const exportToExcel = () => {
    let csvContent = "\uFEFF";
    csvContent += "Tarih;Islem;Kategori;Tutar\n";
    personTransactions.forEach(t => {
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
    link.download = `KisiEkstresi_${new Date().toLocaleDateString('tr-TR')}.csv`;
    link.click();
  };

  return (
    <div 
      className="modal-overlay print-overlay" 
      onClick={onClose} 
      style={{ 
        zIndex: 100, 
        alignItems: 'center', 
        justifyContent: 'center',
        maxWidth: '100%',
        left: 0,
        transform: 'none',
        padding: '20px'
      }}
    >
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()} 
        style={{ 
          maxWidth: '700px', 
          width: '100%', 
          borderRadius: '24px', 
          maxHeight: '90vh', 
          overflowY: 'auto' 
        }}
      >
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
          
          <div className="flex gap-2 items-center hide-charts-on-print">
            <button onClick={exportToExcel} title="Excel İndir" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-success">
              <Download size={20} />
            </button>
            <button onClick={() => window.print()} title="Yazdır / PDF Al" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-primary">
              <Printer size={20} />
            </button>
            <button onClick={onClose} className="p-2 text-muted hover:text-main rounded-full bg-gray-100 transition-colors">
            <X size={20} />
          </button>
          </div>

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

        <div className="flex gap-2 mb-4">
          <button 
            onClick={handleExportCSV}
            className="flex-1 py-2 px-3 flex items-center justify-center gap-2 rounded-lg font-bold transition-colors"
            style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}
          >
            <Download size={16} /> Excel (CSV)
          </button>
          <button 
            onClick={handlePrint}
            className="flex-1 py-2 px-3 flex items-center justify-center gap-2 rounded-lg font-bold transition-colors"
            style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}
          >
            <Printer size={16} /> PDF / Yazdır
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

              
  const exportToExcel = () => {
    let csvContent = "\uFEFF";
    csvContent += "Tarih;Islem;Kategori;Tutar\n";
    personTransactions.forEach(t => {
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
    link.download = `KisiEkstresi_${new Date().toLocaleDateString('tr-TR')}.csv`;
    link.click();
  };

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
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className={`font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {isPositive ? '+' : '-'}{formatMoney(t.amount)}
                          </p>
                        </div>
                        {(currentUser?.role === 'admin' || t.addedBy === currentUser?.id) && (
                          <>
                            <button onClick={() => onOpenForm && onOpenForm(t)} className="hide-on-print text-muted ml-2 hover:text-primary" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => deleteTransaction(t.id)} className="hide-on-print text-danger ml-1 hover:text-red-700" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                );
              })}
            </div>
          )}

          {personTransactions.length > 0 && (
            <div className="mt-4 p-4 rounded-lg bg-gray-50 flex justify-between items-center border border-gray-200 print-only" style={{ display: 'none' }}>
              <span className="font-bold text-gray-700">Dönem İçi Toplam Değişim:</span>
              <span className="font-bold text-xl text-primary">
                {formatMoney(
                  personTransactions.reduce((acc, t) => {
                    let isDebtToMe = false;
                    if (t.type === 'debt_given' || t.type === 'debt_payment') isDebtToMe = true;
                    return acc + (isDebtToMe ? t.amount : -t.amount);
                  }, 0)
                )}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonStatement;
