import React, { useState } from 'react';
import { BudgetProvider } from './context/BudgetContext';
import Dashboard from './components/Dashboard';
import Charts from './components/Charts';
import Accounts from './components/Accounts';
import BottomNav from './components/BottomNav';
import TransactionForm from './components/TransactionForm';
import Settings from './components/Settings';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState(null);

  const handleOpenForm = (tx = null) => {
    setTransactionToEdit(tx);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setTransactionToEdit(null);
  };

  return (
    <BudgetProvider>
      <div className="w-full h-full min-h-screen relative">
        
        <main className="w-full">
          {activeTab === 'dashboard' && <Dashboard onEditTransaction={handleOpenForm} />}
          {activeTab === 'accounts' && <Accounts />}
          {activeTab === 'charts' && <Charts />}
          {activeTab === 'settings' && <Settings />}
        </main>

        <BottomNav 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onOpenForm={() => handleOpenForm(null)}
        />

        {isFormOpen && (
          <TransactionForm 
            onClose={handleCloseForm} 
            transactionToEdit={transactionToEdit}
          />
        )}
        
      </div>
    </BudgetProvider>
  );
}

export default App;
