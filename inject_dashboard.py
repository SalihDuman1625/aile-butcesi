import re

with open('src/components/Dashboard.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Add IncomeExpenseStatement import
code = code.replace(
    "import PersonStatement from './PersonStatement';",
    "import PersonStatement from './PersonStatement';\nimport IncomeExpenseStatement from './IncomeExpenseStatement';"
)
code = code.replace(
    "import { ShoppingBag",
    "import { TrendingDown, TrendingUp, ShoppingBag"
)

# 2. Add current month income/expense calculations
calc_target = "const sumDebtsOwedToMe = activeDebts.filter(d => d.netAmount > 0).reduce((sum, d) => sum + d.netAmount, 0);"
calc_repl = """const sumDebtsOwedToMe = activeDebts.filter(d => d.netAmount > 0).reduce((sum, d) => sum + d.netAmount, 0);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const currentMonthTxs = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const currentMonthIncome = currentMonthTxs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const currentMonthExpense = currentMonthTxs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const [selectedIncomeExpenseForStatement, setSelectedIncomeExpenseForStatement] = useState(null);
"""
code = code.replace(calc_target, calc_repl)

# 3. Add widget boxes
box_target = """        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">"""
box_repl = """        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="widget-box widget-income" onClick={() => setSelectedIncomeExpenseForStatement('income')}>
            <div className="widget-header">
              <div className="widget-icon"><TrendingUp size={16} /></div>
              <span className="widget-title">Bu Ayki Gelirler</span>
            </div>
            <p className="widget-value">{formatMoney(currentMonthIncome)}</p>
          </div>

          <div className="widget-box widget-expense" onClick={() => setSelectedIncomeExpenseForStatement('expense')}>
            <div className="widget-header">
              <div className="widget-icon"><TrendingDown size={16} /></div>
              <span className="widget-title">Bu Ayki Giderler</span>
            </div>
            <p className="widget-value">{formatMoney(currentMonthExpense)}</p>
          </div>
"""
code = code.replace(box_target, box_repl)

# 4. Add the modal rendering at the bottom
modal_target = "{selectedPersonForStatement && ("
modal_repl = """{selectedIncomeExpenseForStatement && (
        <IncomeExpenseStatement 
          type={selectedIncomeExpenseForStatement}
          monthIndex={currentMonth}
          year={currentYear}
          onClose={() => setSelectedIncomeExpenseForStatement(null)}
          onOpenForm={onEditTransaction}
        />
      )}

      {selectedPersonForStatement && ("""
code = code.replace(modal_target, modal_repl)

with open('src/components/Dashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
