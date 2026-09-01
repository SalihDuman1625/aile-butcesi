import re

with open('src/components/Charts.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add startDate, endDate to state
new_states = """  const [dateRange, setDateRange] = useState('Bu Ay');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');"""
  
code = code.replace("const [dateRange, setDateRange] = useState('Bu Ay');", new_states)

# Update getFilteredTransactions call
code = code.replace(
    "const filteredTxs = getFilteredTransactions({ dateRange, category, person, type });",
    "const filteredTxs = getFilteredTransactions({ dateRange, category, person, type, startDate, endDate });"
)

# Replace the dateRange select
old_select = """<select value={dateRange} onChange={e => setDateRange(e.target.value)} className="form-input flex-1" style={{ padding: '0.4rem', fontSize: '0.875rem' }}>
              <option value="Bu Ay">Bu Ay</option>
              <option value="Geen Ay">Geen Ay</option>
              <option value="TǬmǬ">TǬm Zamanlar</option>
            </select>"""
            
old_select_regex = re.compile(r'<select value=\{dateRange\} onChange=\{e => setDateRange\(e\.target\.value\)\} className="form-input flex-1" style=\{\{ padding: \'0\.4rem\', fontSize: \'0\.875rem\' \}\}>\s*<option value="Bu Ay">Bu Ay<\/option>\s*<option value="Ge.*?en Ay">Ge.*?en Ay<\/option>\s*<option value="T.*?m.*?">T.*?m Zamanlar<\/option>\s*<\/select>', re.DOTALL)

new_select = """<select value={dateRange} onChange={e => setDateRange(e.target.value)} className="form-input flex-1" style={{ padding: '0.4rem', fontSize: '0.875rem' }}>
              <option value="Bu Ay">Bu Ay</option>
              <option value="Geçen Ay">Geçen Ay</option>
              <option value="Bu Yıl">Bu Yıl</option>
              <option value="Tümü">Tüm Zamanlar</option>
              <option value="Özel">Özel Tarih</option>
            </select>"""

code = old_select_regex.sub(new_select, code)

# After the row of selects (where the type select is), we can inject the date inputs if it's "Özel"
# Let's find the closing div of the first flex gap-2
filter_block_regex = re.compile(r'(<div className="flex gap-2">.*?<\/div>\s*<\/div>)', re.DOTALL)
# wait, it's easier to just insert after the `dateRange` select itself!
date_inputs = """{dateRange === 'Özel' && (
              <div className="flex gap-1 flex-1">
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="form-input w-1/2" style={{ padding: '0.4rem', fontSize: '0.75rem' }} />
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="form-input w-1/2" style={{ padding: '0.4rem', fontSize: '0.75rem' }} />
              </div>
            )}"""

# But it's in a flex row. Let's just wrap it in a flex column.
code = code.replace(
    new_select, 
    f"""<div className="flex flex-col flex-1 gap-1">
            {new_select}
            {date_inputs}
            </div>"""
)

with open('src/components/Charts.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
