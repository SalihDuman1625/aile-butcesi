import subprocess

result = subprocess.run(['git', 'show', '9761f09:src/components/Dashboard.jsx'], capture_output=True)
clean_code = result.stdout.decode('utf-8')

# Apply safe imports
code = clean_code.replace(
    "import React, { useState, useEffect } from 'react';", 
    "import React, { useState, useEffect, useRef } from 'react';"
)
code = code.replace(
    "import { ShoppingBag, Coffee, Home, Zap, Heart, Book, Film, MoreHorizontal, Briefcase, TrendingUp, DollarSign, AlertCircle, CheckCircle2, Trash2, Edit2, ArrowRightLeft, HandCoins, Building, CreditCard, Coins, X, Landmark, Handshake } from 'lucide-react';",
    "import { TrendingDown, ShoppingBag, Coffee, Home, Zap, Heart, Book, Film, MoreHorizontal, Briefcase, TrendingUp, DollarSign, AlertCircle, CheckCircle2, Trash2, Edit2, ArrowRightLeft, HandCoins, Building, CreditCard, Coins, X, Landmark, Handshake } from 'lucide-react';\nimport IncomeExpenseStatement from './IncomeExpenseStatement';\nimport PersonStatement from './PersonStatement';"
)

# Apply safe state
code = code.replace(
    "  const [widgetOrder, setWidgetOrder] = useState([\n    'bank', 'cash', 'cc', 'inv', 'rec', 'debt', 'income', 'expense'\n  ]);",
    "  const defaultWidgetOrder = ['bank', 'cash', 'cc', 'inv', 'rec', 'debt', 'income', 'expense'];\n  const [widgetOrder, setWidgetOrder] = useState(() => {\n    try {\n      const saved = localStorage.getItem('dashboardWidgetOrder');\n      if (saved) return JSON.parse(saved);\n    } catch(e) {}\n    return defaultWidgetOrder;\n  });\n\n  const dragItem = useRef(null);\n  const dragOverItem = useRef(null);\n\n  const handleDragStart = (e, position) => {\n    dragItem.current = position;\n  };\n\n  const handleDragEnter = (e, position) => {\n    dragOverItem.current = position;\n  };\n\n  const handleDragEnd = () => {\n    const newOrder = [...widgetOrder];\n    const draggedItemContent = newOrder[dragItem.current];\n    newOrder.splice(dragItem.current, 1);\n    newOrder.splice(dragOverItem.current, 0, draggedItemContent);\n    dragItem.current = null;\n    dragOverItem.current = null;\n    setWidgetOrder(newOrder);\n    localStorage.setItem('dashboardWidgetOrder', JSON.stringify(newOrder));\n  };"
)

# Replace Grid container logic
grid_old = """      {/* Small Widgets */}
      <div className="widgets-grid mt-4">
        
        <div className="widget-box widget-bank" onClick={() => setSelectedAccountForStatement(accounts.find(a => a.type === 'bank' && a.name === 'Banka'))}>"""
grid_new = """      {/* Small Widgets */}
      <div className="widgets-grid mt-4">
"""
code = code.replace(grid_old, grid_new)

# Re-inject the renderWidget method right above the widgets-grid!
render_widget_code = """
  const renderWidget = (id, idx) => {
    switch(id) {
      case 'bank':
        return (
          <div key="bank" draggable onDragStart={(e) => handleDragStart(e, idx)} onDragEnter={(e) => handleDragEnter(e, idx)} onDragEnd={handleDragEnd} className="widget-box widget-bank" onClick={() => setSelectedAccountForStatement(accounts.find(a => a.type === 'bank' && a.name === 'Banka'))}>
            <div className="widget-header">
              <div className="widget-icon"><Building size={16} /></div>
              <span className="widget-title">Banka</span>
            </div>
            <p className="widget-value">{formatMoney(sumBank)}</p>
          </div>
        );
      case 'cash':
        return (
          <div key="cash" draggable onDragStart={(e) => handleDragStart(e, idx)} onDragEnter={(e) => handleDragEnter(e, idx)} onDragEnd={handleDragEnd} className="widget-box widget-cash" onClick={() => setSelectedAccountForStatement(accounts.find(a => a.type === 'cash' && a.name === 'Nakit Kasa'))}>
            <div className="widget-header">
              <div className="widget-icon"><Coins size={16} /></div>
              <span className="widget-title">Nakit Kasa</span>
            </div>
            <p className="widget-value">{formatMoney(sumCash)}</p>
          </div>
        );
      case 'cc':
        return (
          <div key="cc" draggable onDragStart={(e) => handleDragStart(e, idx)} onDragEnter={(e) => handleDragEnter(e, idx)} onDragEnd={handleDragEnd} className="widget-box widget-cc" onClick={() => setSelectedAccountForStatement(accounts.find(a => a.type === 'cc' && a.name === 'Kredi Kartı'))}>
            <div className="widget-header">
              <div className="widget-icon"><CreditCard size={16} /></div>
              <span className="widget-title">Kredi Kartı</span>
            </div>
            <p className="widget-value">{formatMoney(sumCC)}</p>
          </div>
        );
      case 'inv':
        return (
          <div key="inv" draggable onDragStart={(e) => handleDragStart(e, idx)} onDragEnter={(e) => handleDragEnter(e, idx)} onDragEnd={handleDragEnd} className="widget-box widget-inv" onClick={() => setSelectedAccountForStatement(accounts.find(a => a.type === 'investment' && a.name === 'Birikimler'))}>
            <div className="widget-header">
              <div className="widget-icon"><Landmark size={16} /></div>
              <span className="widget-title">Birikimler</span>
            </div>
            <p className="widget-value">{formatMoney(sumInv)}</p>
          </div>
        );
      case 'rec':
        return (
          <div key="rec" draggable onDragStart={(e) => handleDragStart(e, idx)} onDragEnter={(e) => handleDragEnter(e, idx)} onDragEnd={handleDragEnd} className="widget-box widget-rec" onClick={() => setActiveWidget('receivables')}>
            <div className="widget-header">
              <div className="widget-icon"><Handshake size={16} /></div>
              <span className="widget-title">Alacaklarım</span>
            </div>
            <p className="widget-value">{formatMoney(sumDebtsOwedToMe)}</p>
          </div>
        );
      case 'debt':
        return (
          <div key="debt" draggable onDragStart={(e) => handleDragStart(e, idx)} onDragEnter={(e) => handleDragEnter(e, idx)} onDragEnd={handleDragEnd} className="widget-box widget-debt" onClick={() => setActiveWidget('debts')}>
            <div className="widget-header">
              <div className="widget-icon"><Handshake size={16} /></div>
              <span className="widget-title">Borçlarım</span>
            </div>
            <p className="widget-value">{formatMoney(sumDebtsIOwe)}</p>
          </div>
        );
      case 'income':
        return (
          <div key="income" draggable onDragStart={(e) => handleDragStart(e, idx)} onDragEnter={(e) => handleDragEnter(e, idx)} onDragEnd={handleDragEnd} className="widget-box widget-income" onClick={() => setSelectedIncomeExpenseForStatement('income')} style={{cursor: 'pointer'}}>
            <div className="widget-header">
              <div className="widget-icon"><TrendingUp size={16} /></div>
              <span className="widget-title">Gelirler (Bu Ay)</span>
            </div>
            <p className="widget-value">{formatMoney(currentMonthIncome)}</p>
          </div>
        );
      case 'expense':
        return (
          <div key="expense" draggable onDragStart={(e) => handleDragStart(e, idx)} onDragEnter={(e) => handleDragEnter(e, idx)} onDragEnd={handleDragEnd} className="widget-box widget-expense" onClick={() => setSelectedIncomeExpenseForStatement('expense')} style={{cursor: 'pointer'}}>
            <div className="widget-header">
              <div className="widget-icon"><TrendingDown size={16} /></div>
              <span className="widget-title">Giderler (Bu Ay)</span>
            </div>
            <p className="widget-value">{formatMoney(currentMonthExpense)}</p>
          </div>
        );
      default:
        return null;
    }
  };

      {/* Small Widgets */}
      <div className="widgets-grid mt-4">
        {widgetOrder.map((id, index) => renderWidget(id, index))}
      </div>
"""

# Find where the widgets-grid ends and replace the whole block
import re
code = re.sub(
    r'\{\/\* Small Widgets \*\/\}.*?</div>\s*</div>',
    render_widget_code,
    code,
    flags=re.DOTALL
)

# And add the missing states!
code = code.replace(
    "const [selectedPersonForStatement, setSelectedPersonForStatement] = useState(null);",
    "const [selectedPersonForStatement, setSelectedPersonForStatement] = useState(null);\n  const [selectedIncomeExpenseForStatement, setSelectedIncomeExpenseForStatement] = useState(null);"
)

code = code.replace(
    "      {selectedPersonForStatement && (\n        <PersonStatement \n          personData={selectedPersonForStatement} \n          onClose={() => setSelectedPersonForStatement(null)} \n          onOpenForm={onEditTransaction} \n        />\n      )}",
    "      {selectedPersonForStatement && (\n        <PersonStatement \n          personData={selectedPersonForStatement} \n          onClose={() => setSelectedPersonForStatement(null)} \n          onOpenForm={onEditTransaction} \n        />\n      )}\n\n      {selectedIncomeExpenseForStatement && (\n        <IncomeExpenseStatement \n          type={selectedIncomeExpenseForStatement}\n          monthIndex={currentMonth}\n          year={currentYear}\n          onClose={() => setSelectedIncomeExpenseForStatement(null)}\n          onOpenForm={onEditTransaction}\n        />\n      )}"
)

with open('src/components/Dashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Dashboard rewritten safely without touching UTF-8 characters.")
