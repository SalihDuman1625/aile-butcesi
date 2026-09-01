import React, { useState } from 'react';
import { BudgetProvider } from './context/BudgetContext';
import Dashboard from './components/Dashboard';
import Charts from './components/Charts';
import Accounts from './components/Accounts';
import BottomNav from './components/BottomNav';
import TransactionForm from './components/TransactionForm';
import Settings from './components/Settings';
import ExchangeRates from './components/ExchangeRates';

import ActivationGuard from './components/ActivationGuard';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState(null);
  const [prefillData, setPrefillData] = useState(null);

  const handleOpenForm = (tx = null, prefill = null) => {
    setTransactionToEdit(tx);
    setPrefillData(prefill);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setTransactionToEdit(null);
    setPrefillData(null);
  };

  return (
    <ErrorBoundary>
      <BudgetProvider>
        <ActivationGuard>
          <div className="w-full h-full min-h-screen relative">
            
            <main className="w-full">
              {activeTab === 'dashboard' && <Dashboard onEditTransaction={handleOpenForm} onViewAll={() => setActiveTab('charts')} />}
              {activeTab === 'accounts' && <Accounts onOpenForm={handleOpenForm} />}
              {activeTab === 'charts' && <Charts onOpenForm={handleOpenForm} />}
              {activeTab === 'settings' && <Settings />}
        {activeTab === 'rates' && <ExchangeRates />}

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
                prefillData={prefillData}
              />
            )}
            
          </div>
        </ActivationGuard>
      </BudgetProvider>
    </ErrorBoundary>
  );
}

export default App;
