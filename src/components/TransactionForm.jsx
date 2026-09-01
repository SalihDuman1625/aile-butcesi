import React, { useState, useEffect, useMemo } from 'react';
import { useBudget } from '../context/BudgetContext';
import { X, Edit2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_CATEGORIES = {
  expense: ['Mutfak', 'Fatura', 'Kira', 'Ulaşım', 'Sağlık', 'Eğitim', 'Eğlence', 'Giyim', 'Diğer'],
  income: ['Maaş', 'Diğer'],
  transfer: ['Transfer / Virman'],
  debt_given: ['Borç Verildi'],
  debt_taken: ['Borç Alındı'],
  debt_collection: ['Borç Tahsilatı (Bana Ödendi)'],
  debt_payment: ['Borç Ödemesi (Ben Ödedim)']
};

const formatAmountDisplay = (val) => {
  if (val === null || val === undefined) return '';
  let str = val.toString();
  // Remove all non-numeric characters except comma
  str = str.replace(/[^0-9,]/g, '');
  const parts = str.split(',');
  if (parts.length > 2) {
    str = parts[0] + ',' + parts.slice(1).join('');
  }
  const parts2 = str.split(',');
  if (parts2[0]) {
    parts2[0] = parts2[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    str = parts2.join(',');
  }
  return str;
};

const TransactionForm = ({ onClose, transactionToEdit, prefillData }) => {
  const { addTransaction, editTransaction, transactions, accounts, addAccount, editAccount, addBill } = useBudget();
  
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

  // Taksit State'leri
  const [isInstallment, setIsInstallment] = useState(false);
  const [installmentCount, setInstallmentCount] = useState(2);
  const [startingInstallment, setStartingInstallment] = useState(1);
  const [amountType, setAmountType] = useState('total'); // 'total' veya 'monthly'

  // Hızlı Hesap Ekleme State'leri
  const [showQuickAccount, setShowQuickAccount] = useState(false);
  const [quickAccountName, setQuickAccountName] = useState('');
  const [quickAccountType, setQuickAccountType] = useState('bank');

  
  const handleEditSelectedAccount = (id) => {
    const acc = accounts.find(a => a.id === id);
    if (!acc) return;
    const newName = window.prompt("Hesap adını düzeltin:", acc.name);
    if (newName && newName.trim() !== '' && newName !== acc.name) {
      editAccount(id, { ...acc, name: newName.trim() });
    }
  };

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
      setAmount(formatAmountDisplay(transactionToEdit.amount.toString().replace('.', ',')));
      setCategory(transactionToEdit.category);
      setDate(transactionToEdit.date.split('T')[0]);
      if (transactionToEdit.dueDate) setDueDate(transactionToEdit.dueDate.split('T')[0]);
      
      setAccountType(transactionToEdit.accountType || 'Ev');
      setPerson(transactionToEdit.person === 'Ortak' ? '' : (transactionToEdit.person || ''));
      setAccountId(transactionToEdit.accountId || '');
      setTargetAccountId(transactionToEdit.targetAccountId || '');
      setIsInstallment(false); // Düzenlemede taksit eklenmez
    } else if (prefillData) {
      setType(prefillData.type);
      if (prefillData.person) setPerson(prefillData.person);
      setCategory(DEFAULT_CATEGORIES[prefillData.type]?.[0] || 'Diğer');
      if (prefillData.type === 'debt_collection') setTitle('Tahsilat');
      if (prefillData.type === 'debt_payment') setTitle('Ödeme');
      
      if (accounts.length > 0) {
        setAccountId(accounts[0].id);
      }
    } else {
      if (accounts.length > 0) {
        setAccountId(accounts[0].id);
        if (accounts.length > 1) setTargetAccountId(accounts[1].id);
      }
    }
  }, [transactionToEdit, prefillData, accounts]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !amount || !date || !accountId) return;
    if (type === 'transfer' && !targetAccountId) return;
    if (['debt_given', 'debt_taken', 'debt_collection', 'debt_payment'].includes(type) && !person) {
      alert("Lütfen borç/tahsilat/ödeme işlemi için bir Kişi Adı girin.");
      return;
    }

    const parsedAmount = parseFloat(amount.toString().replace(/\./g, '').replace(',', '.'));
    
    // Taksitli İşlem Kaydı
    if (type === 'expense' && isInstallment && installmentCount > 1 && !transactionToEdit) {
      const remainingInstallments = (parseInt(installmentCount) - parseInt(startingInstallment)) + 1;
      const monthlyAmount = amountType === 'total' ? parsedAmount / remainingInstallments : parsedAmount;
      
      // İlk işlemi kaydet
      const txData = {
        type,
        title: `${title} (Taksit ${startingInstallment}/${installmentCount})`,
        amount: monthlyAmount,
        category: category.trim() || DEFAULT_CATEGORIES[type][0],
        date: new Date(date).toISOString(),
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        accountType,
        person: person.trim() || 'Ortak',
        accountId,
        targetAccountId: null
      };
      addTransaction(txData);
      
      // Kalan taksitleri fatura olarak kaydet
      const billData = {
        name: title,
        category: category.trim() || DEFAULT_CATEGORIES[type][0],
        dueDay: new Date(date).getDate(),
        isFixed: true,
        expectedAmount: monthlyAmount,
        defaultAccountId: accountId,
        isInstallment: true,
        totalInstallments: parseInt(installmentCount),
        paidInstallments: parseInt(startingInstallment)
      };
      addBill(billData);
    } else {
      const txData = {
        type,
        title,
        amount: parsedAmount,
        category: category.trim() || DEFAULT_CATEGORIES[type][0],
        date: new Date(date).toISOString(),
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        accountType,
        person: person.trim() || 'Ortak',
        accountId,
        targetAccountId: type === 'transfer' ? targetAccountId : null
      };

      if (transactionToEdit) {
        editTransaction(transactionToEdit.id, txData);
      } else {
        addTransaction(txData);
      }
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
    } else if (newType === 'debt_collection') {
      setTitle('Tahsilat');
    } else if (newType === 'debt_payment') {
      setTitle('Ödeme');
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
              <option value="debt_collection">Borç Tahsilatı (Bana Ödendi)</option>
              <option value="debt_payment">Borç Ödemesi (Ben Ödedim)</option>
            </select>
          </div>

          <div className="form-group mb-4">
            <label className="form-label">Tutar (₺)</label>
            <input 
              type="text" 
              inputMode="decimal"
              placeholder="0,00" 
              value={amount} 
              onChange={e => setAmount(formatAmountDisplay(e.target.value))}
              className="form-input text-lg font-bold"
              style={{ fontSize: '1.25rem' }}
              autoFocus
              required
            />
          </div>

          {type === 'expense' && !transactionToEdit && (
            <div className="form-group p-3 rounded-lg" style={{ backgroundColor: '#F0F9FF', border: '1px solid #BAE6FD' }}>
              <label className="flex items-center gap-2 font-bold mb-2 cursor-pointer text-primary">
                <input 
                  type="checkbox" 
                  checked={isInstallment} 
                  onChange={e => setIsInstallment(e.target.checked)} 
                  style={{ width: '18px', height: '18px' }}
                />
                Bu Bir Taksitli İşlem / Kredi Ödemesi mi?
              </label>
              
              {isInstallment && (
                <div className="flex flex-col gap-3 mt-3">
                  <div className="flex gap-4">
                    <div style={{ flex: 1 }}>
                      <label className="form-label text-xs">Toplam Taksit Sayısı</label>
                      <input 
                        type="number" 
                        min="2" 
                        max="360"
                        value={installmentCount} 
                        onChange={e => setInstallmentCount(e.target.value)}
                        className="form-input"
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="form-label text-xs">Bu Ödeme Kaçıncı Taksit?</label>
                      <input 
                        type="number" 
                        min="1" 
                        max={installmentCount}
                        value={startingInstallment} 
                        onChange={e => setStartingInstallment(e.target.value)}
                        className="form-input"
                      />
                      <p className="text-[10px] text-muted mt-1">Eski krediyse bulunduğunuz taksiti yazın (Örn: 27)</p>
                    </div>
                  </div>
                  <div>
                    <label className="form-label text-xs">Yukarıya Girdiğiniz Tutar Hangisi?</label>
                    <select 
                      value={amountType} 
                      onChange={e => setAmountType(e.target.value)} 
                      className="form-input"
                    >
                      <option value="total">Kalan Toplam Borç Tutarı (Kendisi Bölecek)</option>
                      <option value="monthly">Sadece 1 Aylık Taksit Tutarı</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* HESAP SEÇİMLERİ & HIZLI EKLEME */}
          <div className="form-group border border-border p-3 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
            <div className="flex justify-between items-center mb-2">
              <label className="form-label mb-0" style={{ fontWeight: 'bold' }}>
                {type === 'expense' ? 'Nereden Ödenecek?' : 
                 type === 'income' ? 'Nereye Gelecek?' :
                 type === 'transfer' ? 'Çıkış Yapılacak (Gönderen) Hesap' :
                 (type === 'debt_given' || type === 'debt_payment') ? 'Para Nereden Çıkacak?' : 'Para Hangi Hesaba Girecek?'}
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
                <div className="grid grid-cols-3 gap-2 w-full">
                  <select 
                    value={quickAccountType} 
                    onChange={e => setQuickAccountType(e.target.value)}
                    className="form-input col-span-2"
                    style={{ padding: '0.5rem', fontSize: '0.9rem' }}
                  >
                    <option value="bank">Banka</option>
                    <option value="cash">Nakit</option>
                    <option value="credit_card">Kredi Kartı</option>
                  </select>
                  <button type="button" onClick={handleQuickAddAccount} className="btn btn-primary col-span-1 whitespace-nowrap" style={{ padding: '0.5rem 1rem' }}>Ekle</button>
                </div>
              </div>
            ) : (
                <div className="flex gap-2 items-center w-full">
                  <select 
                    value={accountId} 
                    onChange={e => setAccountId(e.target.value)} 
                    className="form-input flex-1"
                    required
                  >
                    {accounts.length === 0 && <option value="">Önce hesap ekleyin</option>}
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.type === 'bank' ? 'Banka' : acc.type === 'credit_card' ? 'Kredi Kartı' : acc.type === 'investment' ? 'Birikim' : 'Nakit'})
                      </option>
                    ))}
                  </select>
                  {accountId && (
                    <button type="button" onClick={() => handleEditSelectedAccount(accountId)} className="p-2 text-muted hover:text-primary bg-gray-100 rounded flex-shrink-0" title="Seçili Hesabın Adını Düzenle">
                      <Edit2 size={18} />
                    </button>
                  )}
                </div>
              )}
          </div>

          {type === 'transfer' && (
            <div className="form-group p-3 rounded-lg" style={{ backgroundColor: '#EEF2FF', border: '1px solid #C7D2FE' }}>
              <label className="form-label text-primary">Hedef Hesap (Para Nereye Gidecek?)</label>
              <div className="flex gap-2 items-center w-full">
                  <select 
                    value={targetAccountId} 
                    onChange={e => setTargetAccountId(e.target.value)} 
                    className="form-input flex-1"
                    required
                  >
                    <option value="">Seçiniz</option>
                    {accounts.filter(a => a.id !== accountId).map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.type === 'bank' ? 'Banka' : acc.type === 'credit_card' ? 'Kredi Kartı' : acc.type === 'investment' ? 'Birikim' : 'Nakit'})
                      </option>
                    ))}
                  </select>
                  {targetAccountId && (
                    <button type="button" onClick={() => handleEditSelectedAccount(targetAccountId)} className="p-2 text-muted hover:text-primary bg-white border border-gray-200 rounded flex-shrink-0" title="Seçili Hesabın Adını Düzenle">
                      <Edit2 size={18} />
                    </button>
                  )}
                </div>
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
              <label className="form-label">{(type === 'debt_given' || type === 'debt_taken') ? 'Veriliş / Alınış Tarihi' : 'Tarih'}</label>
              <input 
                type="date" 
                value={date} 
                onChange={e => setDate(e.target.value)} 
                className="form-input" 
                required 
              />
            </div>
            
            {(type === 'debt_given' || type === 'debt_taken') ? (
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
              <label className="form-label">Kişi Adı {['debt_given', 'debt_taken', 'debt_collection', 'debt_payment'].includes(type) && <span className="text-danger">*</span>}</label>
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
