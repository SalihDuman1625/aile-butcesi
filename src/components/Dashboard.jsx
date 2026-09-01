import React, { useState } from 'react';
import { useBudget } from '../context/BudgetContext';
import { TrendingDown, ShoppingBag, Coffee, Home, Zap, Heart, Book, Film, MoreHorizontal, Briefcase, TrendingUp, DollarSign, AlertCircle, CheckCircle2, Trash2, Edit2, ArrowRightLeft, HandCoins, Building, CreditCard, Coins, X, Landmark, Handshake } from 'lucide-react';
import IncomeExpenseStatement from './IncomeExpenseStatement';
import PersonStatement from './PersonStatement';
import PayBillModal from './PayBillModal';
import AccountStatement from './AccountStatement';

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

const Dashboard = ({ onEditTransaction }) => {
  const { transactions, accounts, getAccountBalances, getUpcomingBills, getForecastForNextMonth, getDebts, deleteTransaction, users, currentUser } = useBudget();
  const { totalCashAndBank, totalCCDebt, totalInvestments, netWorth } = getAccountBalances();
  const upcomingBills = getUpcomingBills();
  const forecast = getForecastForNextMonth();
  const activeDebts = getDebts();

  const [billToPay, setBillToPay] = useState(null);
  
  // Widget Detail State
  const [activeWidget, setActiveWidget] = useState(null);
  const [selectedAccountForStatement, setSelectedAccountForStatement] = useState(null);

  const formatMoney = (amount) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);

  const recentTransactions = transactions.slice(0, 15);

  const cashAccounts = accounts.filter(a => a.type === 'cash');
  const bankAccounts = accounts.filter(a => a.type === 'bank');
  const ccAccounts = accounts.filter(a => a.type === 'credit_card');
  const invAccounts = accounts.filter(a => a.type === 'investment');

  const sumCash = cashAccounts.reduce((sum, a) => sum + parseFloat(a.balance||0), 0);
  const sumBank = bankAccounts.reduce((sum, a) => sum + parseFloat(a.balance||0), 0);
  const sumCC = ccAccounts.reduce((sum, a) => sum + parseFloat(a.balance||0), 0);
  const sumInv = invAccounts.reduce((sum, a) => sum + parseFloat(a.balance||0), 0);
  
  const sumDebtsIOwe = activeDebts.filter(d => d.netAmount < 0).reduce((sum, d) => sum + Math.abs(d.netAmount), 0);
  const sumDebtsOwedToMe = activeDebts.filter(d => d.netAmount > 0).reduce((sum, d) => sum + d.netAmount, 0);

  const renderWidgetModal = () => {
    if (!activeWidget) return null;

    let title = '';
    let listData = [];
    let isAccountList = false;

    if (activeWidget === 'cash') { title = 'Nakit Kasalar'; listData = cashAccounts; isAccountList = true; }
    if (activeWidget === 'bank') { title = 'Banka Hesapları'; listData = bankAccounts; isAccountList = true; }
    if (activeWidget === 'cc') { title = 'Kredi Kartları'; listData = ccAccounts; isAccountList = true; }
    if (activeWidget === 'inv') { title = 'Yatırım ve Birikimler'; listData = invAccounts; isAccountList = true; }
    if (activeWidget === 'receivables') { title = 'Alacaklarım'; listData = activeDebts.filter(d => d.netAmount > 0); }
    if (activeWidget === 'debts') { title = 'Borçlarım'; listData = activeDebts.filter(d => d.netAmount < 0); }

    return (
      <div className="modal-overlay" onClick={() => setActiveWidget(null)} style={{ zIndex: 100 }}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-[var(--border-color)]">
            <h2 className="text-xl font-bold text-main">{title}</h2>
            <button onClick={() => setActiveWidget(null)} className="p-1 text-muted hover:text-main rounded-full bg-gray-100">
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto">
            {listData.length === 0 ? (
              <p className="text-center text-muted py-6">Bu kategoride kayıt bulunmuyor.</p>
            ) : (
              listData.map((item, idx) => (
                <div 
                  key={item.id || idx} 
                  className={`card p-3 flex justify-between items-center ${isAccountList ? 'cursor-pointer hover:border-[var(--primary-color)]' : ''}`}
                  style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)' }}
                  onClick={() => {
                    if (isAccountList) {
                      setActiveWidget(null);
                      setSelectedAccountForStatement(item);
                    }
                  }}
                >
                  <div>
                    <p className="font-bold text-main">{isAccountList ? item.name : item.person}</p>
                    {isAccountList && item.type === 'investment' && item.assetType !== 'TL' && (
                      <p className="text-xs text-primary font-semibold mt-1">
                        {item.assetAmount} {item.assetType} (Birim: {formatMoney(item.assetRate)})
                      </p>
                    )}
                    {!isAccountList && (
                      <p className="text-xs text-muted mt-1">Vade: {item.latestDueDate ? new Date(item.latestDueDate).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${isAccountList && item.balance < 0 ? 'text-danger' : 'text-main'}`}>
                      {isAccountList ? formatMoney(item.balance) : formatMoney(Math.abs(item.netAmount))}
                    </p>
                  </div>
                </div>
              ))
            )}
            
            {isAccountList && listData.length > 0 && (
              <p className="text-xs text-center text-muted mt-2">Detaylı hesap ekstresi (mutabakat) için bir hesaba tıklayın.</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      
      {/* Header */}
      <div className="flex justify-between items-center mt-2">
        <div>
          <p className="text-muted text-sm font-medium">Hoş Geldiniz 👋</p>
          <h1 className="text-xl font-bold mt-1 text-main">Finans Özeti</h1>
        </div>
      </div>

      {/* DASHBOARD WIDGETS GRID */}
      <div className="grid grid-cols-2 gap-3 mt-1">
        
        {/* Net Worth (Full Width) */}
        <div className="col-span-2 credit-card flex flex-col justify-center items-start">
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem', letterSpacing: '1px' }}>NET VARLIK</p>
          <h2 className="text-4xl font-extrabold" style={{ letterSpacing: '-1px' }}>{formatMoney(netWorth)}</h2>
        </div>

        {/* Small Widgets with Elegant Layout */}
        <div className="widget-box widget-bank" onClick={() => setActiveWidget('bank')}>
          <div className="widget-header">
            <div className="widget-icon"><Building size={16} /></div>
            <span className="widget-title">Banka</span>
          </div>
          <p className="widget-value">{formatMoney(sumBank)}</p>
        </div>

        <div className="widget-box widget-cash" onClick={() => setActiveWidget('cash')}>
          <div className="widget-header">
            <div className="widget-icon"><Coins size={16} /></div>
            <span className="widget-title">Nakit Kasa</span>
          </div>
          <p className="widget-value">{formatMoney(sumCash)}</p>
        </div>

        <div className="widget-box widget-cc" onClick={() => setActiveWidget('cc')}>
          <div className="widget-header">
            <div className="widget-icon"><CreditCard size={16} /></div>
            <span className="widget-title">Kredi Kartı</span>
          </div>
          <p className="widget-value">{formatMoney(sumCC)}</p>
        </div>

        <div className="widget-box widget-inv" onClick={() => setActiveWidget('inv')}>
          <div className="widget-header">
            <div className="widget-icon"><Landmark size={16} /></div>
            <span className="widget-title">Birikimler</span>
          </div>
          <p className="widget-value">{formatMoney(sumInv)}</p>
        </div>

        <div className="widget-box widget-rec" onClick={() => setActiveWidget('receivables')}>
          <div className="widget-header">
            <div className="widget-icon"><Handshake size={16} /></div>
            <span className="widget-title">Alacaklarım</span>
          </div>
          <p className="widget-value">{formatMoney(sumDebtsOwedToMe)}</p>
        </div>

        <div className="widget-box widget-debt" onClick={() => setActiveWidget('debts')}>
          <div className="widget-header">
            <div className="widget-icon"><Handshake size={16} /></div>
            <span className="widget-title">Borçlarım</span>
          </div>
          <p className="widget-value">{formatMoney(sumDebtsIOwe)}</p>
        </div>

      </div>

      {/* Upcoming Bills Alert */}
      {upcomingBills.length > 0 && (
        <div className="flex flex-col gap-2 mt-4">
          <h3 className="font-bold text-sm text-muted">Yaklaşan Ödemeler</h3>
          {upcomingBills.map(bill => (
            <div key={bill.id} className="card flex items-center justify-between" style={{ backgroundColor: '#FEF2F2', borderColor: '#FCA5A5', padding: '0.75rem 1rem' }}>
              <div className="flex items-center gap-3">
                <AlertCircle className="text-danger" size={24} />
                <div>
                  <p className="font-bold text-danger text-sm">{bill.name}</p>
                  <p className="text-xs text-danger opacity-80">Son {bill.daysLeft} gün (Ayın {bill.dueDay}'i)</p>
                </div>
              </div>
              <button 
                onClick={() => setBillToPay(bill)} 
                className="btn btn-primary flex items-center gap-1" 
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderRadius: '8px', width: 'auto' }}
              >
                <CheckCircle2 size={16} /> Öde
              </button>
            </div>
          ))}
        </div>
      )}

      {/* AI Forecast Card */}
      <div className="card mt-2 flex justify-between items-center" style={{ background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)', border: '1px solid #BBF7D0' }}>
        <div>
          <p className="text-success" style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>🤖 YAPAY ZEKA TAHMİNİ</p>
          <p className="font-bold text-main text-sm">Gelecek Ay Gideri</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-extrabold text-success">{formatMoney(forecast)}</p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="mt-4 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-main">Son İşlemler</h3>
          <button style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>Tümü</button>
        </div>
        
        {recentTransactions.length === 0 ? (
          <div className="card text-center text-muted" style={{ padding: '2.5rem 1rem' }}>
            Henüz işlem bulunmuyor.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {recentTransactions.map(t => (
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
                      <button onClick={() => onEditTransaction(t)} className="text-muted ml-2 hover:text-primary" style={{ background: 'none', border: 'none' }}>
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => deleteTransaction(t.id)} className="text-danger ml-1 hover:text-red-700" style={{ background: 'none', border: 'none' }}>
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {billToPay && (
        <PayBillModal bill={billToPay} onClose={() => setBillToPay(null)} />
      )}
      
      {selectedAccountForStatement && (
        <AccountStatement account={selectedAccountForStatement} onClose={() => setSelectedAccountForStatement(null)} />
      )}

      {renderWidgetModal()}

    </div>
  );
};

export default Dashboard;
