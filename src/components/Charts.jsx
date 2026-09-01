import React, { useState } from 'react';
import { openDetailedReportPdf } from '../utils/pdfExport';
import { useBudget } from '../context/BudgetContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Share2, Filter, SearchX, FileText, FileBarChart, ShoppingBag, Coffee, Home, Zap, Heart, Book, Film, MoreHorizontal, Briefcase, TrendingUp, DollarSign, Trash2, Edit2, ArrowRightLeft, HandCoins } from 'lucide-react';
import PersonStatement from './PersonStatement';
import FinancialStatement from './FinancialStatement';

const getCategoryIcon = (category, type) => {
  if (type === 'transfer') return <ArrowRightLeft size={20} />;
  if (type === 'debt_given' || type === 'debt_taken') return <HandCoins size={20} />;
  if (type === 'income') {
    if (category === 'Maaş') return <Briefcase size={20} />;
    if (category === 'Yatırım Getirisi') return <TrendingUp size={20} />;
    return <DollarSign size={20} />;
  }
  switch(category) {
    case 'Mutfak': return <ShoppingBag size={20} />;
    case 'Kira': return <Home size={20} />;
    case 'Fatura': return <Zap size={20} />;
    case 'Sağlık': return <Heart size={20} />;
    case 'Eğitim': return <Book size={20} />;
    case 'Eğlence': return <Film size={20} />;
    case 'Ulaşım': return <MoreHorizontal size={20} />;
    default: return <Coffee size={20} />;
  }
};

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316', '#64748B'];

const CATEGORIES = ['Tümü', 'Mutfak', 'Fatura', 'Kira', 'Ulaşım', 'Sağlık', 'Eğitim', 'Eğlence', 'Giyim', 'Diğer', 'Maaş', 'Transfer / Virman', 'Borç Verildi', 'Borç Alındı'];

const Charts = ({ onOpenForm }) => {
  const { transactions, getFilteredTransactions, getDebts, deleteTransaction, users, currentUser } = useBudget();
  
    const [dateRange, setDateRange] = useState('Bu Ay');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('Tümü');
  const [person, setPerson] = useState('Tümü');
  const [type, setType] = useState('all');

  const [selectedPersonForStatement, setSelectedPersonForStatement] = useState(null);
  const [showFinancialStatement, setShowFinancialStatement] = useState(false);

  const uniquePersons = ['Tümü', ...new Set(transactions.map(t => t.person).filter(Boolean))];

  const filteredTxs = getFilteredTransactions({ dateRange, category, person, type, startDate, endDate });

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

  const exportToPDF = () => { openDetailedReportPdf(dateRange, person, category, totalIncome, totalExpense, filteredTxs); };

  const handleOpenStatement = () => {
    if (person !== 'Tümü') {
      const activeDebts = getDebts();
      const debtProfile = activeDebts.find(d => d.person === person);
      setSelectedPersonForStatement(debtProfile || { person, netAmount: 0, latestDueDate: null, transactions: [] });
    }
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

      <button onClick={() => setShowFinancialStatement(true)} className="btn w-full flex items-center justify-center gap-2 mb-2 hide-on-print shadow-sm" style={{ padding: '0.6rem', backgroundColor: '#0F172A', color: 'white', fontSize: '0.9rem' }}>
        <FileBarChart size={16} /> Bilanço ve Gelir Tablosu (Özet)
      </button>

      {person !== 'Tümü' && (
        <button onClick={handleOpenStatement} className="btn w-full flex items-center justify-center gap-2 mb-2 hide-on-print" style={{ padding: '0.6rem', backgroundColor: 'var(--primary-color)', color: 'white', fontSize: '0.9rem' }}>
          <FileText size={16} /> Bu Kişinin Cari Ekstresini Görüntüle
        </button>
      )}

      {/* Filter Bar */}
      <div className="card flex flex-col gap-3" style={{ border: 'none', backgroundColor: 'var(--bg-color)' }}>
        <div className="flex items-center gap-2 text-primary font-bold text-sm mb-1">
          <Filter size={16} /> Filtreler
        </div>
        
        <div className="flex gap-2">
          <div className="flex flex-col flex-1 gap-1">
            <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="form-input flex-1" style={{ padding: '0.4rem', fontSize: '0.875rem' }}>
              <option value="Bu Ay">Bu Ay</option>
              <option value="Geçen Ay">Geçen Ay</option>
              <option value="Bu Yıl">Bu Yıl</option>
              <option value="Tümü">Tüm Zamanlar</option>
              <option value="Özel">Özel Tarih</option>
            </select>
            {dateRange === 'Özel' && (
              <div className="flex gap-1 flex-1">
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="form-input w-1/2" style={{ padding: '0.4rem', fontSize: '0.75rem' }} />
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="form-input w-1/2" style={{ padding: '0.4rem', fontSize: '0.75rem' }} />
              </div>
            )}
            </div>
          
          <select value={type} onChange={e => setType(e.target.value)} className="form-input flex-1" style={{ padding: '0.4rem', fontSize: '0.875rem' }}>
            <option value="all">Tüm Türler</option>
            <option value="expense">Giderler</option>
            <option value="income">Gelirler</option>
            <option value="transfer">Transferler</option>
            <option value="debt_given">Verilen Borçlar</option>
            <option value="debt_taken">Alınan Borçlar</option>
          </select>
        </div>

        <div className="flex gap-2 relative">
          <input 
            type="text"
            list="reports-persons"
            value={person === 'Tümü' ? '' : person}
            onChange={e => setPerson(e.target.value === '' ? 'Tümü' : e.target.value)}
            placeholder="Tüm Kişiler (Kişi Ara)"
            className="form-input flex-1" 
            style={{ padding: '0.4rem', fontSize: '0.875rem' }}
          />
          <datalist id="reports-persons">
            {uniquePersons.filter(p => p !== 'Tümü').map(p => <option key={p} value={p} />)}
          </datalist>
          
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

          <div className="hide-charts-on-print mt-8">
            <h3 className="text-lg font-bold mb-4 px-1">Filtrelenen İşlemler ({filteredTxs.length})</h3>
            <div className="flex flex-col gap-3">
              {filteredTxs.map(t => (
                <div key={t.id} className="card flex justify-between items-center" style={{ border: 'none', padding: '1rem' }}>
                  <div className="flex items-center gap-3">
                    <div style={{ 
                      width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backgroundColor: (t.type === 'income' || t.type === 'debt_taken') ? '#ECFDF5' : (t.type === 'transfer' ? '#EFF6FF' : 'var(--bg-color)'),
                      color: (t.type === 'income' || t.type === 'debt_taken') ? 'var(--success)' : (t.type === 'transfer' ? 'var(--primary-color)' : 'var(--text-main)')
                    }}>
                       {getCategoryIcon(t.category, t.type)}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-main">{t.title}</p>
                      <p className="text-xs text-muted" style={{ marginTop: '0.125rem', fontSize: '0.7rem' }}>
                        {t.category} • {t.accountType ? t.accountType + ' • ' : ''}{t.person ? (t.person === 'Ortak' ? '' : t.person + ' • ') : ''}{new Date(t.date).toLocaleDateString('tr-TR')}
                      </p>
                      <p className="text-[10px] text-muted opacity-70 mt-1">
                        Ekleyen: {users.find(u => u.id === t.addedBy)?.name || 'Yönetici'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className={`font-bold text-sm ${(t.type === 'income' || t.type === 'debt_taken') ? 'text-success' : (t.type === 'transfer' ? 'text-primary' : 'text-main')}`}>
                        {t.type === 'expense' || t.type === 'debt_given' ? '-' : ''}
                        {t.type === 'income' || t.type === 'debt_taken' ? '+' : ''}
                        {formatMoney(t.amount)}
                      </p>
                    </div>
                    
                    {(currentUser.role === 'admin' || t.addedBy === currentUser.id) && (
                      <>
                        <button onClick={() => onOpenForm(t)} className="text-muted ml-2 hover:text-primary" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => deleteTransaction(t.id)} className="text-danger ml-1 hover:text-red-700" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

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

      {selectedPersonForStatement && (
        <PersonStatement 
          personData={selectedPersonForStatement} 
          onClose={() => setSelectedPersonForStatement(null)} 
          onOpenForm={onOpenForm}
        />
      )}

      {showFinancialStatement && (
        <FinancialStatement
          onClose={() => setShowFinancialStatement(false)}
          dateRange={dateRange}
          filteredTransactions={filteredTxs}
        />
      )}
    </div>
  );
};

export default Charts;
