import codecs
with codecs.open('src/components/Charts.jsx', 'r', 'utf-8') as f:
    code = f.read()

list_render = '''
          </div>

          <div className="hide-charts-on-print mt-8">
            <h3 className="text-lg font-bold mb-4 px-1">Filtrelenen İşlemler ({filteredTxs.length})</h3>
            <div className="flex flex-col gap-3">
              {filteredTxs.map(t => (
                <div key={t.id} className="card flex justify-between items-center" style={{ border: 'none', padding: '1rem' }}>
                  <div className="flex items-center gap-3">
                    <div style={{ 
                      width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backgroundColor: (t.type === 'income' || t.type === 'debt_taken') ? '#ECFDF5' : (t.type === 'transfer' ? '#EFF6FF' : 'var(--bg-color)'),
                      color: (t.type === 'income' || t.type === 'debt_taken') ? 'var(--success)' : (t.type === 'transfer' ? 'var(--primary-color)' : 'var(--text-main)')
                    }}>
                       {getCategoryIcon(t.category, t.type)}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-main">{t.title}</p>
                      <p className="text-xs text-muted" style={{ marginTop: '0.125rem', fontSize: '0.7rem' }}>
                        {t.category} • {t.accountType ? t.accountType + ' • ' : ''}{t.person ? (t.person === 'Ortak' ? '' : t.person + ' • ') : ''}{new Date(t.date).toLocaleDateString('tr-TR')}
                      </p>
                      <p className="text-[10px] text-muted opacity-70 mt-1">
                        Ekleyen: {users.find(u => u.id === t.addedBy)?.name || 'Yönetici'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className={`font-bold text-sm ${(t.type === 'income' || t.type === 'debt_taken') ? 'text-success' : (t.type === 'transfer' ? 'text-primary' : 'text-main')}`}>
                        {t.type === 'expense' || t.type === 'debt_given' ? '-' : ''}
                        {t.type === 'income' || t.type === 'debt_taken' ? '+' : ''}
                        {formatMoney(t.amount)}
                      </p>
                    </div>
                    
                    {(currentUser.role === 'admin' || t.addedBy === currentUser.id) && (
                      <>
                        <button onClick={() => onOpenForm(t)} className="text-muted ml-2 hover:text-primary" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => deleteTransaction(t.id)} className="text-danger ml-1 hover:text-red-700" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
'''
code = code.replace('<div className="print-only" style={{ display: \'none\' }}>', list_render + '\n          <div className="print-only" style={{ display: \'none\' }}>')

with codecs.open('src/components/Charts.jsx', 'w', 'utf-8') as f:
    f.write(code)
