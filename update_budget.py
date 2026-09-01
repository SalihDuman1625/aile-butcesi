import re

with open('src/context/BudgetContext.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

get_filtered_txs = """
  const getFilteredTransactions = ({ dateRange, category, person, type, startDate, endDate }) => {
    return transactions.filter(t => {
      if (category && category !== 'Tümü' && category !== 'TǬmǬ' && t.category !== category) return false;
      if (person && person !== 'Tümü' && person !== 'TǬmǬ' && t.person !== person) return false;
      if (type && type !== 'all' && t.type !== type) return false;
      
      const tDate = new Date(t.date);
      const now = new Date();
      if (dateRange === 'Bu Ay') {
        if (tDate.getMonth() !== now.getMonth() || tDate.getFullYear() !== now.getFullYear()) return false;
      } else if (dateRange === 'Geçen Ay' || dateRange === 'Geen Ay') {
        const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        if (tDate.getMonth() !== lastMonth || tDate.getFullYear() !== year) return false;
      } else if (dateRange === 'Bu Yıl' || dateRange === 'Bu Yl') {
        if (tDate.getFullYear() !== now.getFullYear()) return false;
      } else if (dateRange === 'Özel' || dateRange === '-zel') {
        if (startDate) {
          const s = new Date(startDate);
          s.setHours(0,0,0,0);
          if (tDate < s) return false;
        }
        if (endDate) {
          const e = new Date(endDate);
          e.setHours(23,59,59,999);
          if (tDate > e) return false;
        }
      }
      return true;
    });
  };
"""

code = re.sub(r'const getFilteredTransactions = \(\{.*?\}\) => \{.*?return true;\s*\}\);\s*\};', get_filtered_txs.strip(), code, flags=re.DOTALL)

with open('src/context/BudgetContext.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
