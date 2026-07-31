import React, { useState } from 'react';
import { useBudget } from '../context/BudgetContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Share2, Filter, SearchX } from 'lucide-react';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316', '#64748B'];

const CATEGORIES = ['Tümü', 'Mutfak', 'Fatura', 'Kira', 'Ulaşım', 'Sağlık', 'Eğitim', 'Eğlence', 'Giyim', 'Diğer', 'Maaş', 'Transfer / Virman', 'Borç Verildi', 'Borç Alındı'];

const Charts = () => {
  const { transactions, getFilteredTransactions } = useBudget();
  
  const [dateRange, setDateRange] = useState('Bu Ay');
  const [category, setCategory] = useState('Tümü');
  const [person, setPerson] = useState('Tümü');
  const [type, setType] = useState('all');

  const uniquePersons = ['Tümü', ...new Set(transactions.map(t => t.person).filter(Boolean))];

  const filteredTxs = getFilteredTransactions({ dateRange, category, person, type });

  // Calculate summary for filtered data
  let totalIncome = 0;
  let totalExpense = 0;
  const categoryMap = {};

  filteredTxs.forEach(t => {
    if (t.type === 'income' || t.type === 'debt_taken') totalIncome += parseFloat(t.amount);
    if (t.type === 'expense' || t.type === 'debt_given') {
      totalExpense += parseFloat(t.amount);
      categoryMap[t.category] = (categoryMap[t.category] || 0) + parseFloat(t.amount);
    }
  });

  const comparisonData = [
    { name: 'Gelir/Borç Alma', value: totalIncome, fill: 'var(--success)' },
    { name: 'Gider/Borç Verme', value: totalExpense, fill: 'var(--danger)' }
  ];

  const expensesData = Object.keys(categoryMap).map(key => ({ name: key, value: categoryMap[key] })).sort((a,b) => b.value - a.value);

  const formatMoney = (amount) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);

  const shareViaWhatsApp = () => {
    let text = `*Aile Bütçesi - Rapor Özeti*\n`;
    text += `📅 Tarih: ${dateRange}\n`;
    if (person !== 'Tümü') text += `👤 Kişi: ${person}\n`;
    if (category !== 'Tümü') text += `🏷️ Kategori: ${category}\n`;
    
    text += `\n💰 Toplam Gelir: ${formatMoney(totalIncome)}\n`;
    text += `💸 Toplam Gider: ${formatMoney(totalExpense)}\n\n`;
    
    if (filteredTxs.length > 0) {
      text += `*Son İşlemler:*\n`;
      filteredTxs.slice(0, 10).forEach(t => {
        const sign = (t.type === 'expense' || t.type === 'debt_given') ? '-' : (t.type === 'transfer' ? '' : '+');
        text += `- ${t.title} (${t.person}): ${sign}${formatMoney(t.amount)}\n`;
      });
    }

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const exportToCSV = () => {
    let csv = 'Tarih;Kategori;Kişi;Tur;Tutar;Aciklama\n';
    filteredTxs.forEach(t => {
      const typeStr = t.type === 'expense' ? 'Gider' : t.type === 'income' ? 'Gelir' : t.type === 'transfer' ? 'Transfer' : t.type === 'debt_given' ? 'Borc Verildi' : 'Borc Alindi';
      const amountStr = t.amount.toString().replace('.', ','); // Tutar noktasını virgüle çevir (Excel Türkçe için)
      csv += `${t.date.split('T')[0]};"${t.category}";"${t.person}";"${typeStr}";"${amountStr}";"${t.title}"\n`;
    });
    
    // Add BOM for Excel UTF-8 support
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AileButcesi_Rapor_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportToPDF = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-4 p-5 pb-32 print-container">
      <div className="mt-2 mb-2 flex justify-between items-center hide-on-print">
        <div>
          <h2 className="text-2xl font-bold">Gelişmiş Raporlar</h2>
          <p className="text-muted mt-1" style={{ fontSize: '0.875rem' }}>Filtrele ve Dışa Aktar</p>
        </div>
      </div>

      <div className="flex gap-2 hide-on-print mb-2">
        <button onClick={exportToCSV} className="btn flex-1 flex items-center justify-center gap-1" style={{ padding: '0.5rem', backgroundColor: '#10B981', color: 'white', fontSize: '0.8rem' }}>
           Excel
        </button>
        <button onClick={exportToPDF} className="btn flex-1 flex items-center justify-center gap-1" style={{ padding: '0.5rem', backgroundColor: '#EF4444', color: 'white', fontSize: '0.8rem' }}>
           PDF
        </button>
        <button onClick={shareViaWhatsApp} className="btn flex-1 flex items-center justify-center gap-1" style={{ padding: '0.5rem', backgroundColor: '#25D366', color: 'white', fontSize: '0.8rem' }}>
          <Share2 size={14} /> WhatsApp
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card flex flex-col gap-3" style={{ border: 'none', backgroundColor: 'var(--bg-color)' }}>
        <div className="flex items-center gap-2 text-primary font-bold text-sm mb-1">
          <Filter size={16} /> Filtreler
        </div>
        
        <div className="flex gap-2">
          <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="form-input flex-1" style={{ padding: '0.4rem', fontSize: '0.875rem' }}>
            <option value="Bu Ay">Bu Ay</option>
            <option value="Geçen Ay">Geçen Ay</option>
            <option value="Tümü">Tüm Zamanlar</option>
          </select>
          
          <select value={type} onChange={e => setType(e.target.value)} className="form-input flex-1" style={{ padding: '0.4rem', fontSize: '0.875rem' }}>
            <option value="all">Tüm Türler</option>
            <option value="expense">Giderler</option>
            <option value="income">Gelirler</option>
            <option value="transfer">Transferler</option>
            <option value="debt_given">Verilen Borçlar</option>
            <option value="debt_taken">Alınan Borçlar</option>
          </select>
        </div>

        <div className="flex gap-2">
          <select value={person} onChange={e => setPerson(e.target.value)} className="form-input flex-1" style={{ padding: '0.4rem', fontSize: '0.875rem' }}>
            {uniquePersons.map(p => <option key={p} value={p}>{p === 'Tümü' ? 'Tüm Kişiler' : p}</option>)}
          </select>
          
          <select value={category} onChange={e => setCategory(e.target.value)} className="form-input flex-1" style={{ padding: '0.4rem', fontSize: '0.875rem' }}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex gap-3">
        <div className="card flex-1 text-center" style={{ border: 'none', padding: '1rem' }}>
          <p className="text-xs text-muted mb-1">Toplam Girdi</p>
          <p className="font-bold text-success">{formatMoney(totalIncome)}</p>
        </div>
        <div className="card flex-1 text-center" style={{ border: 'none', padding: '1rem' }}>
          <p className="text-xs text-muted mb-1">Toplam Çıktı</p>
          <p className="font-bold text-danger">{formatMoney(totalExpense)}</p>
        </div>
      </div>

      {filteredTxs.length === 0 ? (
        <div className="card text-center text-muted flex flex-col items-center gap-2" style={{ padding: '3rem 1rem', marginTop: '1rem', border: 'none' }}>
          <SearchX size={32} className="opacity-50" />
          <p>Bu filtrelere uygun işlem bulunamadı.</p>
        </div>
      ) : (
        <>
          <div className="hide-charts-on-print flex flex-col gap-4">
            <div className="card" style={{ border: 'none' }}>
              <h3 className="text-lg font-bold mb-4">Genel Durum</h3>
              <div style={{ height: '220px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} axisLine={false} tickLine={false} />
                    <YAxis stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{fill: 'rgba(0,0,0,0.02)'}}
                      contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', borderRadius: '12px', boxShadow: 'var(--shadow-md)', color: 'var(--text-main)', fontWeight: 'bold' }} 
                      itemStyle={{ color: 'var(--text-main)' }}
                      formatter={(value) => formatMoney(value)}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card" style={{ border: 'none' }}>
              <h3 className="text-lg font-bold mb-4">Harcama Dağılımı</h3>
              {expensesData.length > 0 ? (
                <div style={{ height: '280px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expensesData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {expensesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', borderRadius: '12px', boxShadow: 'var(--shadow-md)', color: 'var(--text-main)', fontWeight: 'bold' }} 
                        formatter={(value) => formatMoney(value)}
                      />
                      <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '0.9rem', color: 'var(--text-main)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-muted text-center" style={{ fontSize: '0.875rem', padding: '1rem 0' }}>Filtrelenen gider verisi yok.</p>
              )}
            </div>
          </div>

          {/* SADECE YAZDIRILIRKEN GÖRÜNEN DETAYLI TABLO (PDF İÇİN) */}
          <div className="print-only" style={{ display: 'none' }}>
            <h2 style={{ fontSize: '18pt', fontWeight: 'bold', marginBottom: '10px' }}>Aile Bütçesi Detaylı Rapor</h2>
            <p style={{ fontSize: '11pt', color: '#666', marginBottom: '15px' }}>
              <strong>Tarih Aralığı:</strong> {dateRange} | <strong>Kişi:</strong> {person} | <strong>Kategori:</strong> {category}
            </p>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <div><strong>Toplam Girdi:</strong> {formatMoney(totalIncome)}</div>
              <div><strong>Toplam Çıktı:</strong> {formatMoney(totalExpense)}</div>
            </div>

            <table className="print-table">
              <thead>
                <tr>
                  <th>Tarih</th>
                  <th>Kategori</th>
                  <th>İşlem Türü</th>
                  <th>Kişi</th>
                  <th>Açıklama</th>
                  <th style={{ textAlign: 'right' }}>Tutar</th>
                </tr>
              </thead>
              <tbody>
                {filteredTxs.map(t => {
                  const typeLabel = t.type === 'expense' ? 'Gider' : t.type === 'income' ? 'Gelir' : t.type === 'transfer' ? 'Transfer' : t.type === 'debt_given' ? 'Borç Verildi' : 'Borç Alındı';
                  const sign = (t.type === 'expense' || t.type === 'debt_given') ? '-' : (t.type === 'transfer' ? '' : '+');
                  return (
                    <tr key={t.id}>
                      <td>{new Date(t.date).toLocaleDateString('tr-TR')}</td>
                      <td>{t.category}</td>
                      <td>{typeLabel}</td>
                      <td>{t.person}</td>
                      <td>{t.title}</td>
                      <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{sign}{formatMoney(t.amount)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Charts;
