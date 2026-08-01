import React, { useState, useEffect, useMemo } from 'react';
import { useBudget } from '../context/BudgetContext';
import { X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_CATEGORIES = {
  expense: ['Mutfak', 'Fatura', 'Kira', 'Ulaşım', 'Sağlık', 'Eğitim', 'Eğlence', 'Giyim', 'Diğer'],
  income: ['Maaş', 'Prim', 'Yatırım Getirisi', 'Kira Geliri', 'Diğer'],
  transfer: ['Transfer / Virman'],
  debt_given: ['Borç Verildi'],
  debt_taken: ['Borç Alındı']
};

const TransactionForm = ({ onClose, transactionToEdit }) => {
  const { addTransaction, editTransaction, transactions, accounts, addAccount } = useBudget();
  
  const [type, setType] = useState('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(DEFAULT_CATEGORIES['expense'][0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(''); // For debts
  
  const [accountType, setAccountType] = useState('Ev');
  const [person, setPerson] = useState('');
  
  const [accountId, setAccountId] = useState(''); // Source
  const [targetAccountId, setTargetAccountId] = useState(''); // Target (for transfer)

  // Hızlı Hesap Ekleme State'leri
  const [showQuickAccount, setShowQuickAccount] = useState(false);
  const [quickAccountName, setQuickAccountName] = useState('');
  const [quickAccountType, setQuickAccountType] = useState('bank');

  const handleQuickAddAccount = () => {
    if (!quickAccountName.trim()) return;
    const newId = uuidv4();
    addAccount({ id: newId, name: quickAccountName.trim(), type: quickAccountType, balance: 0 });
    setAccountId(newId);
    setQuickAccountName('');
    setShowQuickAccount(false);
  };

  const uniquePersons = useMemo(() => {
    return [...new Set(transactions.map(t => t.person).filter(p => p && p !== 'Ortak'))];
  }, [transactions]);

  // Hafızadaki (geçmişte girilmiş) özel kategorileri defaultlarla birleştir
  const availableCategories = useMemo(() => {
    const defaultCats = DEFAULT_CATEGORIES[type] || [];
    const pastCats = transactions
      .filter(t => t.type === type && t.category)
      .map(t => t.category);
    return [...new Set([...defaultCats, ...pastCats])];
  }, [transactions, type]);

  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type);
      setTitle(transactionToEdit.title);
      setAmount(transactionToEdit.amount);
      setCategory(transactionToEdit.category);
      setDate(transactionToEdit.date.split('T')[0]);
      if (transactionToEdit.dueDate) setDueDate(transactionToEdit.dueDate.split('T')[0]);
      
      setAccountType(transactionToEdit.accountType || 'Ev');
      setPerson(transactionToEdit.person === 'Ortak' ? '' : (transactionToEdit.person || ''));
      setAccountId(transactionToEdit.accountId || '');
      setTargetAccountId(transactionToEdit.targetAccountId || '');
    } else {
      if (accounts.length > 0) {
        setAccountId(accounts[0].id);
        if (accounts.length > 1) setTargetAccountId(accounts[1].id);
      }
    }
  }, [transactionToEdit, accounts]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !amount || !date || !accountId) return;
    if (type === 'transfer' && !targetAccountId) return;
    if ((type === 'debt_given' || type === 'debt_taken') && !person) {
      alert("Lütfen borç işlemi için bir Kişi Adı girin.");
      return;
    }

    const txData = {
      type,
      title,
      amount: parseFloat(amount),
      category: category.trim() || DEFAULT_CATEGORIES[type][0],
      date: new Date(date).toISOString(),
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      accountType,
      person: person.trim() || 'Ortak', // Zorunluluk kalktı, boşsa Ortak
      accountId,
      targetAccountId: type === 'transfer' ? targetAccountId : null
    };

    if (transactionToEdit) {
      editTransaction(transactionToEdit.id, txData);
    } else {
      addTransaction(txData);
    }
    
    onClose();
  };

  const handleTypeChange = (newType) => {
    setType(newType);
    setCategory(DEFAULT_CATEGORIES[newType][0]);
    if (newType === 'transfer') {
      setTitle('Hesaplar Arası Transfer');
    } else if (newType === 'debt_given' || newType === 'debt_taken') {
      setTitle(newType === 'debt_given' ? 'Borç Verildi' : 'Borç Alındı');
    } else {
      setTitle('');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{transactionToEdit ? 'İşlemi Düzenle' : 'İşlem Ekle'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ maxHeight: '75vh', overflowY: 'auto', paddingRight: '4px' }}>
          
          <div className="form-group">
            <select 
              value={type} 
              onChange={e => handleTypeChange(e.target.value)} 
              className="form-input font-bold" 
              style={{ backgroundColor: 'var(--bg-color)' }}
            >
              <option value="expense">Gider</option>
              <option value="income">Gelir</option>
              <option value="transfer">Transfer (Virman / K.Kartı Ödeme)</option>
              <option value="debt_given">Borç Verdim (Alacak)</option>
              <option value="debt_taken">Borç Aldım (Borç)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Tutar (₺)</label>
            <input 
              type="number" 
              placeholder="0.00" 
              step="0.01"
              value={amount} 
              onChange={e => setAmount(e.target.value)}
              className="form-input text-lg font-bold"
              style={{ fontSize: '1.25rem' }}
              autoFocus
              required
            />
          </div>

          {/* HESAP SEÇİMLERİ & HIZLI EKLEME */}
          <div className="form-group border border-border p-3 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
            <div className="flex justify-between items-center mb-2">
              <label className="form-label mb-0" style={{ fontWeight: 'bold' }}>
                {type === 'expense' ? 'Nereden Ödenecek?' : 
                 type === 'income' ? 'Nereye Gelecek?' :
                 type === 'transfer' ? 'Çıkış Yapılacak (Gönderen) Hesap' :
                 type === 'debt_given' ? 'Para Nereden Çıkacak?' : 'Para Hangi Hesaba Girecek?'}
              </label>
              <button 
                type="button" 
                onClick={() => setShowQuickAccount(!showQuickAccount)}
                className="text-xs font-bold text-primary flex items-center gap-1"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {showQuickAccount ? 'İptal' : '+ Yeni Hesap Ekle'}
              </button>
            </div>
            
            {showQuickAccount ? (
              <div className="flex flex-col gap-2 bg-white p-3 rounded border border-primary border-dashed">
                <input 
                  type="text" 
                  placeholder="Yeni Hesap Adı (Örn: Ziraat)" 
                  value={quickAccountName}
                  onChange={e => setQuickAccountName(e.target.value)}
                  className="form-input w-full"
                  style={{ padding: '0.5rem', fontSize: '0.9rem' }}
                />
                <div className="flex gap-2 w-full">
                  <select 
                    value={quickAccountType} 
                    onChange={e => setQuickAccountType(e.target.value)}
                    className="form-input flex-1"
                    style={{ padding: '0.5rem', fontSize: '0.9rem' }}
                  >
                    <option value="bank">Banka</option>
                    <option value="cash">Nakit</option>
                    <option value="credit_card">Kredi Kartı</option>
                  </select>
                  <button type="button" onClick={handleQuickAddAccount} className="btn btn-primary whitespace-nowrap" style={{ padding: '0.5rem 1rem' }}>Ekle</button>
                </div>
              </div>
            ) : (
              <select 
                value={accountId} 
                onChange={e => setAccountId(e.target.value)} 
                className="form-input"
                required
              >
                {accounts.length === 0 && <option value="">Önce hesap ekleyin</option>}
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.type === 'bank' ? 'Banka' : acc.type === 'credit_card' ? 'Kredi Kartı' : acc.type === 'investment' ? 'Birikim' : 'Nakit'})
                  </option>
                ))}
              </select>
            )}
          </div>

          {type === 'transfer' && (
            <div className="form-group p-3 rounded-lg" style={{ backgroundColor: '#EEF2FF', border: '1px solid #C7D2FE' }}>
              <label className="form-label text-primary">Hedef Hesap (Para Nereye Gidecek?)</label>
              <select 
                value={targetAccountId} 
                onChange={e => setTargetAccountId(e.target.value)} 
                className="form-input"
                required
              >
                <option value="">Seçiniz</option>
                {accounts.filter(a => a.id !== accountId).map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.type === 'bank' ? 'Banka' : acc.type === 'credit_card' ? 'Kredi Kartı' : acc.type === 'investment' ? 'Birikim' : 'Nakit'})
                  </option>
                ))}
              </select>
              <p className="text-xs text-primary mt-1">Örn: Nakit hesaptan Kredi Kartı seçilirse borç ödenmiş olur.</p>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Açıklama</label>
            <input 
              type="text" 
              placeholder="Örn: Elektrik Faturası" 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="flex gap-4">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">{type.startsWith('debt') ? 'Veriliş / Alınış Tarihi' : 'Tarih'}</label>
              <input 
                type="date" 
                value={date} 
                onChange={e => setDate(e.target.value)}
                className="form-input"
                required
              />
            </div>
            
            {type.startsWith('debt') ? (
               <div className="form-group" style={{ flex: 1 }}>
                 <label className="form-label">Ödeneceği (Vade) Tarihi</label>
                 <input 
                   type="date" 
                   value={dueDate} 
                   onChange={e => setDueDate(e.target.value)}
                   className="form-input"
                 />
               </div>
            ) : (
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Kategori</label>
                <input 
                  type="text" 
                  list="category-list"
                  placeholder="Kategori yazın veya seçin"
                  value={category} 
                  onChange={e => setCategory(e.target.value)} 
                  className="form-input"
                  required
                />
                <datalist id="category-list">
                  {availableCategories.map(c => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Hesap Türü</label>
              <select 
                value={accountType} 
                onChange={e => setAccountType(e.target.value)} 
                className="form-input"
                required
              >
                <option value="Ev">Ev / Şahsi</option>
                <option value="Ticari">Ticari / İş</option>
              </select>
            </div>
            
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Kişi Adı {type.startsWith('debt') && <span className="text-danger">*</span>}</label>
              <input 
                type="text" 
                list="persons"
                placeholder="Örn: Salih (Boşsa Ortak)" 
                value={person} 
                onChange={e => setPerson(e.target.value)}
                className="form-input"
              />
              <datalist id="persons">
                {uniquePersons.map(p => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </div>
          </div>

          <button type="submit" className="btn btn-primary mt-2" disabled={accounts.length === 0}>
            Kaydet
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
