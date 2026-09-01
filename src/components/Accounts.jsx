import React, { useState } from 'react';
import { useBudget } from '../context/BudgetContext';
import { Plus, Trash2, Edit2, ChevronRight, Search } from 'lucide-react';
import AccountForm from './AccountForm';
import BillForm from './BillForm';
import AccountStatement from './AccountStatement';
import PersonStatement from './PersonStatement';

const Accounts = ({ onOpenForm }) => {
  const { accounts, bills, getDebts, deleteAccount, deleteBill, currentUser } = useBudget();
  const activeDebts = getDebts();
  
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState(null);

  const [selectedAccountForStatement, setSelectedAccountForStatement] = useState(null);
  const [selectedPersonForStatement, setSelectedPersonForStatement] = useState(null);
  
  const [searchPerson, setSearchPerson] = useState('');

  const filteredDebts = activeDebts.filter(d => d.person.toLowerCase().includes(searchPerson.toLowerCase()));

  const formatMoney = (amount) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(Math.abs(amount));

  const handleEditAccount = (e, acc) => {
    e.stopPropagation();
    setEditingAccount(acc);
    setIsAccountModalOpen(true);
  };

  const handleDeleteAccount = (e, id) => {
    e.stopPropagation();
    if (currentUser.role !== 'admin') {
      alert("Bu işlem için yönetici yetkisi gereklidir.");
      return;
    }
    deleteAccount(id);
  };

  const handleEditBill = (bill) => {
    setEditingBill(bill);
    setIsBillModalOpen(true);
  };

  const handleDeleteBill = (id) => {
    if (currentUser.role !== 'admin') {
      alert("Bu işlem için yönetici yetkisi gereklidir.");
      return;
    }
    deleteBill(id);
  };

  const openNewAccount = () => {
    setEditingAccount(null);
    setIsAccountModalOpen(true);
  };

  const openNewBill = () => {
    setEditingBill(null);
    setIsBillModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 p-5 relative">
      <div className="mt-2 mb-2">
        <h2 className="text-2xl font-bold">Hesaplar ve Faturalar</h2>
        <p className="text-muted mt-1" style={{ fontSize: '0.875rem' }}>Varlıklarınızı ve sabit ödemelerinizi yönetin</p>
      </div>

      <div className="card" style={{ border: 'none' }}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Varlıklarım</h3>
          <button onClick={openNewAccount} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem', width: 'auto' }}>
            <Plus size={16} style={{ display: 'inline', marginRight: '4px' }}/> Ekle
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {accounts.length === 0 && (
             <p className="text-muted text-center py-4 text-sm">Henüz hesap eklemediniz.</p>
          )}
          {accounts.map(a => (
            <div 
              key={a.id} 
              onClick={() => setSelectedAccountForStatement(a)}
              className="flex justify-between items-center p-3 rounded-lg cursor-pointer transition-colors" 
              style={{ backgroundColor: 'var(--bg-color)', border: '1px solid transparent' }}
              onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary-color)'}
              onMouseOut={e => e.currentTarget.style.borderColor = 'transparent'}
            >
              <div>
                <p className="font-semibold flex items-center gap-1">{a.name} <ChevronRight size={14} className="text-muted" /></p>
                <p className="text-xs text-muted">{a.type === 'bank' ? 'Banka' : a.type === 'credit_card' ? 'Kredi Kartı' : a.type === 'cash' ? 'Nakit' : 'Birikim'}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold">{new Intl.NumberFormat('tr-TR', {style:'currency', currency:'TRY'}).format(a.balance)}</span>
                <div className="flex gap-2">
                  {currentUser.role === 'admin' && (
                    <>
                      <button onClick={(e) => handleEditAccount(e, a)} className="text-muted hover:text-primary" style={{ background:'none', border:'none' }}><Edit2 size={16}/></button>
                      <button onClick={(e) => handleDeleteAccount(e, a.id)} className="text-danger hover:text-red-700" style={{ background:'none', border:'none' }}><Trash2 size={16}/></button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
          <p className="text-xs text-center text-muted mt-2">Hesap ekstresini görmek ve banka mutabakatı yapmak için bir hesabın üstüne tıklayın.</p>
        </div>
      </div>

      <div className="card mb-24" style={{ border: 'none' }}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Sabit Giderler ve Faturalar</h3>
          <button onClick={openNewBill} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem', width: 'auto' }}>
            <Plus size={16} style={{ display: 'inline', marginRight: '4px' }}/> Ekle
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {bills.length === 0 && (
             <p className="text-muted text-center py-4 text-sm">Henüz fatura eklemediniz.</p>
          )}
          {bills.map(b => (
            <div key={b.id} className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-color)' }}>
              <div>
                <p className="font-semibold">
                  {b.name} 
                  {b.isInstallment && <span className="text-xs ml-1 font-normal text-primary">(Kalan Taksit: {b.totalInstallments - (b.paidInstallments || 0)})</span>}
                </p>
                <p className="text-xs text-muted">Ayın {b.dueDay}. Günü • {b.isInstallment ? 'Taksit' : b.isFixed ? 'Sabit' : 'Değişken'}</p>
              </div>
              <div className="flex items-center gap-2">
                {currentUser.role === 'admin' && (
                  <>
                    <button onClick={() => handleEditBill(b)} className="text-muted hover:text-primary" style={{ background:'none', border:'none' }}><Edit2 size={16}/></button>
                    <button onClick={() => handleDeleteBill(b.id)} className="text-danger hover:text-red-700" style={{ background:'none', border:'none' }}><Trash2 size={16}/></button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card mt-2" style={{ border: 'none' }}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Kişiler & Cari Hesaplar</h3>
        </div>

        {activeDebts.length > 0 && (
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input 
              type="text" 
              placeholder="Kişi ara..." 
              value={searchPerson}
              onChange={(e) => setSearchPerson(e.target.value)}
              className="form-input w-full pl-10" 
            />
          </div>
        )}

        <div className="flex flex-col gap-2">
          {activeDebts.length === 0 && (
             <p className="text-muted text-center py-4 text-sm">Hiçbir cari borç/alacak kaydınız yok.</p>
          )}
          {activeDebts.length > 0 && filteredDebts.length === 0 && (
             <p className="text-muted text-center py-4 text-sm">Aramanıza uygun kişi bulunamadı.</p>
          )}
          {filteredDebts.map((d, idx) => {
            const isOverdue = d.latestDueDate && new Date(d.latestDueDate) < new Date(new Date().setHours(0,0,0,0));
            return (
              <div 
                key={d.person + idx} 
                onClick={() => setSelectedPersonForStatement(d)}
                className="flex justify-between items-center p-3 rounded-lg cursor-pointer transition-colors" 
                style={{ backgroundColor: 'var(--bg-color)', border: '1px solid transparent' }}
                onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary-color)'}
                onMouseOut={e => e.currentTarget.style.borderColor = 'transparent'}
              >
                <div>
                  <p className="font-semibold flex items-center gap-1">{d.person} <ChevronRight size={14} className="text-muted" /></p>
                  <p className={`text-xs ${isOverdue ? 'text-red-500 font-bold' : 'text-muted'}`}>
                    {d.latestDueDate ? (isOverdue ? `Vade Geçti: ${new Date(d.latestDueDate).toLocaleDateString('tr-TR')}` : `Vade: ${new Date(d.latestDueDate).toLocaleDateString('tr-TR')}`) : 'Vadesiz'}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${d.netAmount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {d.netAmount > 0 ? '+' : '-'}{formatMoney(d.netAmount)}
                  </p>
                  <p className="text-xs text-muted">{d.netAmount > 0 ? 'Alacak' : 'Borç'}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isAccountModalOpen && (
        <AccountForm 
          onClose={() => setIsAccountModalOpen(false)} 
          accountToEdit={editingAccount} 
        />
      )}

      {isBillModalOpen && (
        <BillForm 
          onClose={() => setIsBillModalOpen(false)} 
          billToEdit={editingBill} 
        />
      )}

      {selectedAccountForStatement && (
        <AccountStatement 
          account={selectedAccountForStatement} 
          onClose={() => setSelectedAccountForStatement(null)} 
          onOpenForm={onOpenForm}
        />
      )}

      {selectedPersonForStatement && (
        <PersonStatement 
          personData={selectedPersonForStatement} 
          onClose={() => setSelectedPersonForStatement(null)} 
          onOpenForm={onOpenForm}
        />
      )}

    </div>
  );
};

export default Accounts;
