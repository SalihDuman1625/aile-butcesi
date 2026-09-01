import re

with open('src/components/IncomeExpenseStatement.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace states
new_states = """  const [dateRange, setDateRange] = useState('Bu Ay');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');"""
  
code = re.sub(r'const \[selectedMonth, setSelectedMonth\] = useState.*?;\s*const \[selectedYear, setSelectedYear\] = useState.*?;', new_states, code, flags=re.DOTALL)


filtered_txs = """
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (t.type !== type) return false;
      
      const tDate = new Date(t.date);
      const now = new Date();
      if (dateRange === 'Bu Ay') {
        if (tDate.getMonth() !== now.getMonth() || tDate.getFullYear() !== now.getFullYear()) return false;
      } else if (dateRange === 'Geçen Ay') {
        const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        if (tDate.getMonth() !== lastMonth || tDate.getFullYear() !== year) return false;
      } else if (dateRange === 'Bu Yıl') {
        if (tDate.getFullYear() !== now.getFullYear()) return false;
      } else if (dateRange === 'Özel') {
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
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, type, dateRange, startDate, endDate]);
"""

code = re.sub(r'const filteredTransactions = useMemo\(\(\) => \{.*?\}, \[transactions, type, selectedMonth, selectedYear\]\);', filtered_txs.strip(), code, flags=re.DOTALL)

# Header update
new_header = """<div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10" style={{ borderRadius: '1rem 1rem 0 0' }}>
          <div>
            <h2 className="text-xl font-bold">{type === 'income' ? 'Gelirler' : 'Giderler'}</h2>
            <div className="flex flex-col md:flex-row gap-2 mt-2 hide-charts-on-print">
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="border border-gray-300 rounded-md p-1 text-sm bg-white"
              >
                <option value="Bu Ay">Bu Ay</option>
                <option value="Geçen Ay">Geçen Ay</option>
                <option value="Bu Yıl">Bu Yıl</option>
                <option value="Tüm Zamanlar">Tüm Zamanlar</option>
                <option value="Özel">Özel Tarih Aralığı</option>
              </select>
              
              {dateRange === 'Özel' && (
                <div className="flex gap-2 items-center">
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border border-gray-300 rounded-md p-1 text-sm bg-white" />
                  <span className="text-xs text-muted">-</span>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border border-gray-300 rounded-md p-1 text-sm bg-white" />
                </div>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors hide-charts-on-print self-start">
            <X size={20} className="text-muted" />
          </button>
        </div>"""
        
code = re.sub(r'<div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10.*?<\/button>\s*<\/div>', new_header, code, flags=re.DOTALL)

with open('src/components/IncomeExpenseStatement.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
