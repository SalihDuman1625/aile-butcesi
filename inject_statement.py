import re

with open('src/components/IncomeExpenseStatement.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace(
    "import React, { useMemo, useEffect } from 'react';",
    "import React, { useMemo, useEffect, useState } from 'react';"
)

code = code.replace(
    "const IncomeExpenseStatement = ({ type, monthIndex, year, onClose, onOpenForm }) => {",
    """const IncomeExpenseStatement = ({ type, monthIndex, year, onClose, onOpenForm }) => {
  const [selectedMonth, setSelectedMonth] = useState(monthIndex.toString());
  const [selectedYear, setSelectedYear] = useState(year.toString());"""
)

code = code.replace(
    "return d.getMonth() === monthIndex && d.getFullYear() === year;",
    """
        if (selectedMonth !== 'all' && d.getMonth() !== parseInt(selectedMonth)) return false;
        if (selectedYear !== 'all' && d.getFullYear() !== parseInt(selectedYear)) return false;
        return true;"""
)

code = code.replace(
    "[transactions, type, monthIndex, year]",
    "[transactions, type, selectedMonth, selectedYear]"
)

header_regex = re.compile(r'<div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10".*?<\/button>\s*<\/div>', re.DOTALL)

header_repl = """<div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10" style={{ borderRadius: '1rem 1rem 0 0' }}>
          <div>
            <h2 className="text-xl font-bold">{type === 'income' ? 'Gelirler' : 'Giderler'}</h2>
            <div className="flex gap-2 mt-2 hide-charts-on-print">
              <select 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border border-gray-300 rounded-md p-1 text-sm bg-white"
              >
                <option value="all">Tüm Aylar</option>
                {Array.from({length: 12}).map((_, i) => (
                  <option key={i} value={i}>{new Date(2000, i).toLocaleDateString('tr-TR', { month: 'long' })}</option>
                ))}
              </select>
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="border border-gray-300 rounded-md p-1 text-sm bg-white"
              >
                <option value="all">Tüm Yıllar</option>
                {[2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <p className="text-sm text-muted mt-1 print-only" style={{ display: 'none' }}>
              {(selectedMonth === 'all' && selectedYear === 'all') ? 'Tüm Zamanlar' : `${selectedMonth !== 'all' ? new Date(2000, parseInt(selectedMonth)).toLocaleDateString('tr-TR', { month: 'long' }) : ''} ${selectedYear !== 'all' ? selectedYear : ''}`}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors hide-charts-on-print">
            <X size={20} className="text-muted" />
          </button>
        </div>"""

code = header_regex.sub(header_repl, code)

code = code.replace(
    "const title = type === 'income' ? 'Bu Ayki Gelirler' : 'Bu Ayki Giderler';\n  const subtitle = new Date(year, monthIndex).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });",
    ""
)

with open('src/components/IncomeExpenseStatement.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
