with open('src/components/Dashboard.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

boxesToMove = """          <div className="widget-box widget-income" onClick={() => setSelectedIncomeExpenseForStatement('income')}>
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
          </div>"""

# Remove from top
code = code.replace(boxesToMove, '')

target = """          <div className="widget-box widget-debt" onClick={() => setActiveWidget('debts')}>
            <div className="widget-header">
              <div className="widget-icon"><Handshake size={16} /></div>
              <span className="widget-title">Borçlarım</span>
            </div>
            <p className="widget-value">{formatMoney(sumDebtsIOwe)}</p>
          </div>"""

code = code.replace(target, target + '\n\n' + boxesToMove)

with open('src/components/Dashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
