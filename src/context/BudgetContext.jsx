import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const BudgetContext = createContext();

export const useBudget = () => useContext(BudgetContext);

export const BudgetProvider = ({ children }) => {
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('budget_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [accounts, setAccounts] = useState(() => {
    const saved = localStorage.getItem('budget_accounts');
    return saved ? JSON.parse(saved) : [];
  });

  const [bills, setBills] = useState(() => {
    const saved = localStorage.getItem('budget_bills');
    return saved ? JSON.parse(saved) : [];
  });

  // Gelişmiş Özellikler: Kullanıcılar, Tema ve Yetkilendirme
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('budget_users');
    return saved ? JSON.parse(saved) : [{ id: '1', name: 'Yönetici', role: 'admin' }];
  });

  const [activeUserId, setActiveUserId] = useState(() => {
    const saved = localStorage.getItem('budget_activeUser');
    return saved || '1';
  });

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('budget_theme');
    return saved || 'light';
  });

  useEffect(() => {
    localStorage.setItem('budget_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('budget_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('budget_bills', JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem('budget_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('budget_activeUser', activeUserId);
  }, [activeUserId]);

  useEffect(() => {
    localStorage.setItem('budget_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const currentUser = users.find(u => u.id === activeUserId) || users[0];

  const addUser = (name, role, pin = '') => {
    setUsers([...users, { id: uuidv4(), name, role, pin }]);
  };

  const deleteUser = (id) => {
    if (users.length <= 1) return; // Son kullanıcı silinemez
    if (activeUserId === id) setActiveUserId(users[0].id);
    setUsers(users.filter(u => u.id !== id));
  };

  const changeUserPin = (userId, newPin) => {
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, pin: newPin } : u)));
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const resetAllData = () => {
    setTransactions([]);
    setAccounts([]);
    setBills([]);
    // Kullanıcıları ve temayı sıfırlamıyoruz
  };

  // Transaction Actions
  const addTransaction = (tx) => {
    const newTx = { 
      ...tx, 
      id: uuidv4(), 
      createdAt: new Date().toISOString(),
      addedBy: currentUser.id // İşlemi kimin yaptığını kaydet
    };
    setTransactions(prev => [newTx, ...prev]);

    // Handle account balances
    if (tx.accountId) {
      updateAccountBalanceForNewTx(tx);
    }
  };

  const editTransaction = (id, updatedTx) => {
    const oldTx = transactions.find(t => t.id === id);
    if (!oldTx) return;

    // Geri alma işlemi (eski bakiyeleri iptal et)
    revertAccountBalance(oldTx);
    
    // Yeni işlemi uygula
    setTransactions(prev => prev.map(t => (t.id === id ? { ...t, ...updatedTx, addedBy: t.addedBy || currentUser.id } : t)));
    updateAccountBalanceForNewTx(updatedTx);
  };

  const deleteTransaction = (id) => {
    const tx = transactions.find(t => t.id === id);
    if (tx) {
      revertAccountBalance(tx);
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const updateAccountBalanceForNewTx = (tx) => {
    setAccounts(prev => prev.map(acc => {
      let newBalance = parseFloat(acc.balance || 0);
      const amt = parseFloat(tx.amount || 0);

      // Normal Gelir/Gider
      if (acc.id === tx.accountId) {
        if (tx.type === 'expense' || tx.type === 'debt_given' || tx.type === 'debt_payment') {
          newBalance -= amt;
        } else if (tx.type === 'income' || tx.type === 'debt_taken' || tx.type === 'debt_collection') {
          newBalance += amt;
        } else if (tx.type === 'transfer') {
          newBalance -= amt; // Çıkış
        }
      }

      // Transfer Hedefi
      if (tx.type === 'transfer' && acc.id === tx.targetAccountId) {
        newBalance += amt; // Giriş
      }

      return { ...acc, balance: newBalance };
    }));
  };

  const revertAccountBalance = (tx) => {
    setAccounts(prev => prev.map(acc => {
      let newBalance = parseFloat(acc.balance || 0);
      const amt = parseFloat(tx.amount || 0);

      if (acc.id === tx.accountId) {
        if (tx.type === 'expense' || tx.type === 'debt_given' || tx.type === 'debt_payment') newBalance += amt;
        else if (tx.type === 'income' || tx.type === 'debt_taken' || tx.type === 'debt_collection') newBalance -= amt;
        else if (tx.type === 'transfer') newBalance += amt;
      }
      if (tx.type === 'transfer' && acc.id === tx.targetAccountId) {
        newBalance -= amt;
      }
      return { ...acc, balance: newBalance };
    }));
  };

  // Account Actions
  const addAccount = (acc) => {
    setAccounts(prev => [...prev, { ...acc, id: acc.id || uuidv4() }]);
  };
  
  const editAccount = (id, updatedAcc) => {
    setAccounts(prev => prev.map(a => (a.id === id ? { ...a, ...updatedAcc } : a)));
  };

  const deleteAccount = (id) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  // Bill Actions
  const addBill = (bill) => setBills(prev => [...prev, { ...bill, id: uuidv4() }]);
  const editBill = (id, updated) => setBills(prev => prev.map(b => (b.id === id ? { ...b, ...updated } : b)));
  const deleteBill = (id) => setBills(prev => prev.filter(b => b.id !== id));

  const markBillAsPaid = (billId, amount, accountId, customTitle) => {
    const bill = bills.find(b => b.id === billId);
    if (!bill) return;

    let finalTitle = customTitle || `${bill.name} Ödemesi`;

    if (bill.isInstallment) {
      const nextInstallment = (bill.paidInstallments || 0) + 1;
      if (!customTitle || customTitle === `${bill.name} Ödemesi`) {
        finalTitle = `${bill.name} (Taksit ${nextInstallment}/${bill.totalInstallments})`;
      }
    }

    addTransaction({
      type: 'expense',
      title: finalTitle,
      amount: parseFloat(amount),
      category: bill.category || 'Fatura',
      date: new Date().toISOString(),
      accountType: 'Ev',
      accountId: accountId
    });

    const today = new Date();

    if (bill.isInstallment) {
      const newPaid = (bill.paidInstallments || 0) + 1;
      if (newPaid >= bill.totalInstallments) {
        deleteBill(bill.id);
        return;
      } else {
        setBills(prev => prev.map(b => 
          b.id === billId ? { ...b, paidInstallments: newPaid, lastPaidMonth: today.getMonth(), lastPaidYear: today.getFullYear() } : b
        ));
        return;
      }
    }

    setBills(prev => prev.map(b => 
      b.id === billId ? { ...b, lastPaidMonth: today.getMonth(), lastPaidYear: today.getFullYear() } : b
    ));
  };

  // Selectors
  const getUpcomingBills = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const currentDay = today.getDate();

    return bills.filter(b => {
      if (b.lastPaidMonth === currentMonth && b.lastPaidYear === currentYear) return false;
      const dueDay = parseInt(b.dueDay);
      const daysLeft = dueDay - currentDay;
      return daysLeft >= 0 && daysLeft <= 7;
    }).map(b => ({ ...b, daysLeft: parseInt(b.dueDay) - currentDay }));
  };

  const getEstimatedBillAmount = (bill) => {
    if (bill.isFixed) {
      return parseFloat(bill.expectedAmount || 0);
    }
    // Değişken faturalar için geçmiş ortalama hesapla
    const pastPayments = transactions.filter(t => t.title && t.title.includes(bill.name));
    if (pastPayments.length > 0) {
      return pastPayments.reduce((s, p) => s + parseFloat(p.amount || 0), 0) / pastPayments.length;
    }
    return 0;
  };

  const getForecastForNextMonth = () => {
    let totalEstimate = 0;
    bills.forEach(b => {
      totalEstimate += getEstimatedBillAmount(b);
    });
    return totalEstimate;
  };

  const getAccountBalances = () => {
    let totalCashAndBank = 0;
    let totalCCDebt = 0;
    let totalInvestments = 0;

    accounts.forEach(a => {
      const bal = parseFloat(a.balance || 0);
      if (a.type === 'cash' || a.type === 'bank') totalCashAndBank += bal;
      if (a.type === 'credit_card') totalCCDebt += bal;
      if (a.type === 'investment') totalInvestments += bal; // Assuming balance is already in TRY
    });

    // Net varlığa verilen/alınan aktif borçları da ekleyebiliriz (opsiyonel)
    const netWorth = totalCashAndBank + totalInvestments + totalCCDebt;
    return { totalCashAndBank, totalCCDebt, totalInvestments, netWorth };
  };

  // Yeni Cari (Borç/Alacak) Sistemi
  const getDebts = () => {
    const debtMap = {};

    transactions.forEach(t => {
      if (['debt_given', 'debt_taken', 'debt_payment', 'debt_collection'].includes(t.type)) {
        const p = t.person || 'Bilinmeyen';
        if (!debtMap[p]) {
          debtMap[p] = { person: p, netAmount: 0, latestDueDate: null, transactions: [] };
        }
        
        if (t.type === 'debt_given') debtMap[p].netAmount += parseFloat(t.amount); // they owe me (+)
        if (t.type === 'debt_taken') debtMap[p].netAmount -= parseFloat(t.amount); // I owe them (-)
        if (t.type === 'debt_collection') debtMap[p].netAmount -= parseFloat(t.amount); // they owe me less
        if (t.type === 'debt_payment') debtMap[p].netAmount += parseFloat(t.amount); // I owe them less
        
        debtMap[p].transactions.push(t);
        
        if (t.dueDate && (t.type === 'debt_given' || t.type === 'debt_taken')) {
          if (!debtMap[p].latestDueDate || new Date(t.dueDate) < new Date(debtMap[p].latestDueDate)) {
            debtMap[p].latestDueDate = t.dueDate;
          }
        }
      }
    });

    return Object.values(debtMap).filter(d => Math.abs(d.netAmount) > 0.01);
  };

  const getFilteredTransactions = ({ dateRange, category, person, type }) => {
    return transactions.filter(t => {
      if (category !== 'Tümü' && t.category !== category) return false;
      if (person !== 'Tümü' && t.person !== person) return false;
      if (type !== 'all' && t.type !== type) return false;
      
      const tDate = new Date(t.date);
      const now = new Date();
      if (dateRange === 'Bu Ay') {
        if (tDate.getMonth() !== now.getMonth() || tDate.getFullYear() !== now.getFullYear()) return false;
      } else if (dateRange === 'Geçen Ay') {
        const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        if (tDate.getMonth() !== lastMonth || tDate.getFullYear() !== year) return false;
      }
      return true;
    });
  };

  return (
    <BudgetContext.Provider value={{
      transactions,
      accounts,
      bills,
      users,
      activeUserId,
      currentUser,
      theme,
      setActiveUserId,
      addUser,
      deleteUser,
      changeUserPin,
      toggleTheme,
      resetAllData,
      addTransaction,
      editTransaction,
      deleteTransaction,
      addAccount,
      editAccount,
      deleteAccount,
      addBill,
      editBill,
      deleteBill,
      markBillAsPaid,
      getUpcomingBills,
      getEstimatedBillAmount,
      getForecastForNextMonth,
      getAccountBalances,
      getDebts,
      getFilteredTransactions
    }}>
      {children}
    </BudgetContext.Provider>
  );
};
