export const openPdfTable = (title, transactions, totalAmount) => {
  const printWindow = window.open('', '_blank');
  
  const formatMoney = (amount) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  
  let tableRows = '';
  transactions.forEach(t => {
    const d = new Date(t.date).toLocaleDateString('tr-TR');
    const tTitle = t.title || '';
    const cat = t.category || '';
    
    let amountStr = '';
    let amountColor = '#334155'; // default dark gray
    
    // Determine sign if needed, or just show amount
    if (t.type === 'expense' || t.type === 'debt_given') {
      amountStr = '-' + formatMoney(t.amount);
      amountColor = '#e11d48'; // elegant red
    } else if (t.type === 'income' || t.type === 'debt_taken') {
      amountStr = '+' + formatMoney(t.amount);
      amountColor = '#059669'; // elegant green
    } else {
      amountStr = formatMoney(t.amount);
    }

    tableRows += `
      <tr>
        <td class="date-col">${d}</td>
        <td>${tTitle}</td>
        <td class="cat-col">${cat}</td>
        <td style="text-align:right; font-weight:500; color:${amountColor};">${amountStr}</td>
      </tr>
    `;
  });

  const html = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
      <style>
        body { 
          font-family: 'Inter', system-ui, -apple-system, sans-serif; 
          padding: 20px 30px; 
          color: #334155; 
          background-color: #fff;
          margin: 0;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          border-bottom: 2px solid #0f172a;
          padding-bottom: 12px;
          margin-bottom: 16px;
        }
        h1 { 
          color: #0f172a; 
          margin: 0; 
          font-size: 22px;
          font-weight: 600;
          letter-spacing: -0.5px;
        }
        .date { 
          color: #64748b; 
          font-size: 11.5px; 
          font-weight: 500;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          font-size: 11.5px; 
        }
        th { 
          text-align: left; 
          padding: 6px 4px;
          color: #475569;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 10px;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #cbd5e1;
        }
        td { 
          padding: 5px 4px; 
          border-bottom: 1px solid #f1f5f9; 
          color: #1e293b;
        }
        tr:last-child td {
          border-bottom: none;
        }
        .date-col { color: #64748b; font-variant-numeric: tabular-nums; }
        .cat-col { color: #64748b; font-size: 11px; }
        
        .total-row { 
          font-weight: 600; 
          font-size: 14px; 
        }
        .total-row td { 
          border-top: 1px solid #0f172a; 
          padding-top: 16px;
          border-bottom: none;
        }
        
        @media print {
          @page { margin: 1cm; }
          body { padding: 0; }
          .print-btn { display: none !important; }
        }
        
        .print-btn { 
          position: fixed;
          top: 20px;
          right: 30px;
          background-color: #0f172a; 
          color: white; 
          border: none; 
          padding: 10px 20px; 
          border-radius: 6px; 
          cursor: pointer; 
          font-weight: 500; 
          font-size: 13px; 
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          transition: all 0.2s;
        }
        .print-btn:hover { 
          background-color: #334155;
          transform: translateY(-1px);
        }
      </style>
    </head>
    <body>
      <button class="print-btn" onclick="window.print()">🖨️ YAZDIR / PDF İNDİR</button>
      
      <div class="header">
        <h1>${title}</h1>
        <div class="date">Oluşturulma Tarihi: ${new Date().toLocaleDateString('tr-TR')}</div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th style="width:15%">Tarih</th>
            <th style="width:45%">İşlem</th>
            <th style="width:20%">Kategori</th>
            <th style="width:20%; text-align:right;">Tutar</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
          <tr class="total-row">
            <td colspan="3" style="text-align:right; color:#64748b; font-size:12px;">GENEL TOPLAM:</td>
            <td style="text-align:right; color:#0f172a; font-size:16px;">${formatMoney(totalAmount)}</td>
          </tr>
        </tbody>
      </table>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};
