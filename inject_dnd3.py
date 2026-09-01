import re

with open('src/components/Dashboard.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add useRef to imports
code = code.replace(
    "import React, { useState, useEffect } from 'react';",
    "import React, { useState, useEffect, useRef } from 'react';"
)

state_insert = """
  const defaultWidgetOrder = ['bank', 'cash', 'cc', 'inv', 'rec', 'debt', 'income', 'expense'];
  const [widgetOrder, setWidgetOrder] = useState(() => {
    const saved = localStorage.getItem('dashboardWidgetOrder');
    if (saved) return JSON.parse(saved);
    return defaultWidgetOrder;
  });

  const saveWidgetOrder = (newOrder) => {
    setWidgetOrder(newOrder);
    localStorage.setItem('dashboardWidgetOrder', JSON.stringify(newOrder));
  };

  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  const handleDragStart = (e, position) => {
    dragItem.current = position;
    e.target.style.opacity = '0.5';
  };

  const handleDragEnter = (e, position) => {
    dragOverItem.current = position;
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    
    if (dragItem.current === null || dragOverItem.current === null) return;
    
    const newOrder = [...widgetOrder];
    const draggedItemContent = newOrder[dragItem.current];
    
    newOrder.splice(dragItem.current, 1);
    newOrder.splice(dragOverItem.current, 0, draggedItemContent);
    
    dragItem.current = null;
    dragOverItem.current = null;
    
    saveWidgetOrder(newOrder);
  };
"""

code = code.replace(
    "const [selectedPersonForStatement, setSelectedPersonForStatement] = useState(null);",
    "const [selectedPersonForStatement, setSelectedPersonForStatement] = useState(null);\n" + state_insert
)

render_fn_code = """
  const renderWidget = (id, idx) => {
    switch(id) {
      case 'bank': return (
          <div key="bank" draggable onDragStart={(e) => handleDragStart(e, idx)} onDragEnter={(e) => handleDragEnter(e, idx)} onDragEnd={handleDragEnd} onDragOver={(e) => e.preventDefault()} className="widget-box widget-bank cursor-move" onClick={() => setActiveWidget('bank')}>
            <div className="widget-header">
              <div className="widget-icon"><Building size={16} /></div>
              <span className="widget-title">Banka</span>
            </div>
            <p className="widget-value">{formatMoney(sumBank)}</p>
          </div>
      );
      case 'cash': return (
          <div key="cash" draggable onDragStart={(e) => handleDragStart(e, idx)} onDragEnter={(e) => handleDragEnter(e, idx)} onDragEnd={handleDragEnd} onDragOver={(e) => e.preventDefault()} className="widget-box widget-cash cursor-move" onClick={() => setActiveWidget('cash')}>
            <div className="widget-header">
              <div className="widget-icon"><Coins size={16} /></div>
              <span className="widget-title">Nakit Kasa</span>
            </div>
            <p className="widget-value">{formatMoney(sumCash)}</p>
          </div>
      );
      case 'cc': return (
          <div key="cc" draggable onDragStart={(e) => handleDragStart(e, idx)} onDragEnter={(e) => handleDragEnter(e, idx)} onDragEnd={handleDragEnd} onDragOver={(e) => e.preventDefault()} className="widget-box widget-cc cursor-move" onClick={() => setActiveWidget('cc')}>
            <div className="widget-header">
              <div className="widget-icon"><CreditCard size={16} /></div>
              <span className="widget-title">Kredi Kartı</span>
            </div>
            <p className="widget-value">{formatMoney(sumCC)}</p>
          </div>
      );
      case 'inv': return (
          <div key="inv" draggable onDragStart={(e) => handleDragStart(e, idx)} onDragEnter={(e) => handleDragEnter(e, idx)} onDragEnd={handleDragEnd} onDragOver={(e) => e.preventDefault()} className="widget-box widget-inv cursor-move" onClick={() => setActiveWidget('inv')}>
            <div className="widget-header">
              <div className="widget-icon"><Landmark size={16} /></div>
              <span className="widget-title">Birikimler</span>
            </div>
            <p className="widget-value">{formatMoney(sumInv)}</p>
          </div>
      );
      case 'rec': return (
          <div key="rec" draggable onDragStart={(e) => handleDragStart(e, idx)} onDragEnter={(e) => handleDragEnter(e, idx)} onDragEnd={handleDragEnd} onDragOver={(e) => e.preventDefault()} className="widget-box widget-rec cursor-move" onClick={() => setActiveWidget('receivables')}>
            <div className="widget-header">
              <div className="widget-icon"><HandCoins size={16} /></div>
              <span className="widget-title">Alacaklarım</span>
            </div>
            <p className="widget-value">{formatMoney(sumDebtsOwedToMe)}</p>
          </div>
      );
      case 'debt': return (
        <div key="debt" draggable onDragStart={(e) => handleDragStart(e, idx)} onDragEnter={(e) => handleDragEnter(e, idx)} onDragEnd={handleDragEnd} onDragOver={(e) => e.preventDefault()} className="widget-box widget-debt cursor-move" onClick={() => setActiveWidget('debts')}>
          <div className="widget-header">
            <div className="widget-icon"><Handshake size={16} /></div>
            <span className="widget-title">Borçlarım</span>
          </div>
          <p className="widget-value">{formatMoney(sumDebtsIOwe)}</p>
        </div>
      );
      case 'income': return (
        <div key="income" draggable onDragStart={(e) => handleDragStart(e, idx)} onDragEnter={(e) => handleDragEnter(e, idx)} onDragEnd={handleDragEnd} onDragOver={(e) => e.preventDefault()} className="widget-box widget-income cursor-move" onClick={() => setSelectedIncomeExpenseForStatement('income')}>
          <div className="widget-header">
            <div className="widget-icon"><TrendingUp size={16} /></div>
            <span className="widget-title">Gelirler (Bu Ay)</span>
          </div>
          <p className="widget-value">{formatMoney(currentMonthIncome)}</p>
        </div>
      );
      case 'expense': return (
        <div key="expense" draggable onDragStart={(e) => handleDragStart(e, idx)} onDragEnter={(e) => handleDragEnter(e, idx)} onDragEnd={handleDragEnd} onDragOver={(e) => e.preventDefault()} className="widget-box widget-expense cursor-move" onClick={() => setSelectedIncomeExpenseForStatement('expense')}>
          <div className="widget-header">
            <div className="widget-icon"><TrendingDown size={16} /></div>
            <span className="widget-title">Giderler (Bu Ay)</span>
          </div>
          <p className="widget-value">{formatMoney(currentMonthExpense)}</p>
        </div>
      );
      default: return null;
    }
  };
"""

code = code.replace(
    "const renderWidgetModal = () => {",
    render_fn_code + "\n  const renderWidgetModal = () => {"
)


# Re-implementing the replace safely for the widget grid
# We want to replace everything inside: <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-1">
# Except the networth card which is before the loop? 
# No, wait! In Dashboard.jsx b197100, the Net Worth card is inside the grid!
# Let's check exactly how Dashboard.jsx looks in b197100.
