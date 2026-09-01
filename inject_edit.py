import re

with open('src/components/TransactionForm.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add editAccount to destructuring
code = code.replace(
    "const { addTransaction, editTransaction, transactions, accounts, addAccount, addBill } = useBudget();",
    "const { addTransaction, editTransaction, transactions, accounts, addAccount, editAccount, addBill } = useBudget();"
)

# Insert handleEditSelectedAccount
insert_handler = """
  const handleEditSelectedAccount = (id) => {
    const acc = accounts.find(a => a.id === id);
    if (!acc) return;
    const newName = window.prompt("Hesap adını düzeltin:", acc.name);
    if (newName && newName.trim() !== '' && newName !== acc.name) {
      editAccount(id, { ...acc, name: newName.trim() });
    }
  };
"""
code = code.replace(
    "const handleQuickAddAccount = () => {",
    insert_handler + "\n  const handleQuickAddAccount = () => {"
)

# Add Edit2 to lucide imports if not there
if "Edit2" not in code:
    code = code.replace("import { X } from 'lucide-react';", "import { X, Edit2 } from 'lucide-react';")

# Replace first select
select_1_old = """              ) : (
                <select 
                  value={accountId} 
                  onChange={e => setAccountId(e.target.value)} 
                  className="form-input"
                  required
                >
                  {accounts.length === 0 && <option value="">Önce hesap ekleyin</option>}
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.type === 'bank' ? 'Banka' : acc.type === 'credit_card' ? 'Kredi Kartı' : acc.type === 'investment' ? 'Birikim' : 'Nakit'})
                    </option>
                  ))}
                </select>
              )"""

# In case encoding has strange chars for Önce and Kredi Kartı
select_1_regex = re.compile(r'\) : \(\s*<select\s*value={accountId}[\s\S]*?<\/select>\s*\)', re.DOTALL)

select_1_new = """) : (
                <div className="flex gap-2 items-center w-full">
                  <select 
                    value={accountId} 
                    onChange={e => setAccountId(e.target.value)} 
                    className="form-input flex-1"
                    required
                  >
                    {accounts.length === 0 && <option value="">Önce hesap ekleyin</option>}
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.type === 'bank' ? 'Banka' : acc.type === 'credit_card' ? 'Kredi Kartı' : acc.type === 'investment' ? 'Birikim' : 'Nakit'})
                      </option>
                    ))}
                  </select>
                  {accountId && (
                    <button type="button" onClick={() => handleEditSelectedAccount(accountId)} className="p-2 text-muted hover:text-primary bg-gray-100 rounded flex-shrink-0" title="Seçili Hesabın Adını Düzenle">
                      <Edit2 size={18} />
                    </button>
                  )}
                </div>
              )"""

code = select_1_regex.sub(select_1_new, code)

# Replace target account select
select_2_regex = re.compile(r'<select\s*value={targetAccountId}[\s\S]*?<\/select>', re.DOTALL)
select_2_new = """<div className="flex gap-2 items-center w-full">
                  <select 
                    value={targetAccountId} 
                    onChange={e => setTargetAccountId(e.target.value)} 
                    className="form-input flex-1"
                    required
                  >
                    <option value="">Seçiniz</option>
                    {accounts.filter(a => a.id !== accountId).map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.type === 'bank' ? 'Banka' : acc.type === 'credit_card' ? 'Kredi Kartı' : acc.type === 'investment' ? 'Birikim' : 'Nakit'})
                      </option>
                    ))}
                  </select>
                  {targetAccountId && (
                    <button type="button" onClick={() => handleEditSelectedAccount(targetAccountId)} className="p-2 text-muted hover:text-primary bg-white border border-gray-200 rounded flex-shrink-0" title="Seçili Hesabın Adını Düzenle">
                      <Edit2 size={18} />
                    </button>
                  )}
                </div>"""

code = select_2_regex.sub(select_2_new, code)

with open('src/components/TransactionForm.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
