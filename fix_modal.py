import re

with open('src/components/Dashboard.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

correct_modal = """  const renderWidgetModal = () => {
    if (!activeWidget) return null;

    let title = '';
    let listData = [];
    let isAccountList = false;

    if (activeWidget === 'cash') { title = 'Nakit Kasalar'; listData = cashAccounts; isAccountList = true; }
    if (activeWidget === 'bank') { title = 'Banka Hesapları'; listData = bankAccounts; isAccountList = true; }
    if (activeWidget === 'cc') { title = 'Kredi Kartları'; listData = ccAccounts; isAccountList = true; }
    if (activeWidget === 'inv') { title = 'Yatırım ve Birikimler'; listData = invAccounts; isAccountList = true; }
    if (activeWidget === 'receivables') { title = 'Alacaklarım'; listData = activeDebts.filter(d => d.netAmount > 0); }
    if (activeWidget === 'debts') { title = 'Borçlarım'; listData = activeDebts.filter(d => d.netAmount < 0); }

    return (
      <div className="modal-overlay" onClick={() => setActiveWidget(null)} style={{ zIndex: 100 }}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-[var(--border-color)]">
            <h2 className="text-xl font-bold text-main">{title}</h2>
            <button onClick={() => setActiveWidget(null)} className="p-1 text-muted hover:text-main rounded-full bg-gray-100">
              <X size={20} />
            </button>
          </div>
          <div className="overflow-y-auto max-h-[60vh]">
            {listData.length === 0 ? (
              <p className="text-center text-muted py-4">Kayıt bulunamadı.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {listData.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => {
                    if (isAccountList) {
                      setSelectedAccountForStatement(item);
                      setActiveWidget(null);
                    } else {
                      setSelectedPersonForStatement(item.person);
                      setActiveWidget(null);
                    }
                  }}>
                    <span className="font-semibold text-main">{isAccountList ? item.name : item.person}</span>
                    <span className="font-bold" style={{ color: isAccountList ? 'var(--text-main)' : (item.netAmount > 0 ? 'var(--success-color)' : 'var(--danger-color)') }}>
                      {formatMoney(Math.abs(isAccountList ? parseFloat(item.balance || 0) : item.netAmount))}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };"""

# We need to replace from `const renderWidgetModal = () => {` all the way to `export default Dashboard;`
# But wait, Dashboard component ends with `  };` and `export default Dashboard;`.
# We need to just replace the whole renderWidgetModal block AND the trailing stuff!

import re

# Find everything from "const renderWidgetModal = () => {" to the end of the file
pattern = r'const renderWidgetModal = \(\) => \{.*'
replacement = correct_modal + """

      {selectedAccountForStatement && (
        <AccountStatement account={selectedAccountForStatement} onClose={() => setSelectedAccountForStatement(null)} onOpenForm={onEditTransaction} />
      )}

      {selectedIncomeExpenseForStatement && (
        <IncomeExpenseStatement 
          type={selectedIncomeExpenseForStatement}
          monthIndex={currentMonth}
          year={currentYear}
          onClose={() => setSelectedIncomeExpenseForStatement(null)}
          onOpenForm={onEditTransaction}
        />
      )}

      {selectedPersonForStatement && (
        <PersonStatement 
          personData={selectedPersonForStatement} 
          onClose={() => setSelectedPersonForStatement(null)} 
          onOpenForm={onEditTransaction} 
        />
      )}

      {renderWidgetModal()}

    </div>
  );
};

export default Dashboard;
"""

new_code = re.sub(pattern, replacement.strip(), code, flags=re.DOTALL)

with open('src/components/Dashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(new_code)
