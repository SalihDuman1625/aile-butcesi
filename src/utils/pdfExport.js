export const openPdfTable = (title, transactions, totalAmount) => {
  const printWindow = window.open('', '_blank');
  
  const formatMoney = (amount) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  
  let tableRows = '';
  transactions.forEach(t => {
    const d = new Date(t.date).toLocaleDateString('tr-TR');
    const tTitle = t.title || '';
    const cat = t.category || '';
    
    let amountStr = '';
    // Determine sign if needed, or just show amount
    if (t.type === 'expense' || t.type === 'debt_given') {
      amountStr = '-' + formatMoney(t.amount);
    } else if (t.type === 'income' || t.type === 'debt_taken') {
      amountStr = '+' + formatMoney(t.amount);
    } else {
      amountStr = formatMoney(t.amount);
    }

    tableRows += `
      <tr>
        <td>${d}</td>
        <td>${tTitle}</td>
        <td>${cat}</td>
        <td style="text-align:right;">${amountStr}</td>
      </tr>
    `;
  });

  const html = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
        h1 { text-align: center; color: #1e293b; margin-bottom: 5px; }
        .date { text-align: center; color: #64748b; font-size: 14px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px; }
        th { background-color: #f1f5f9; padding: 12px; text-align: left; border-bottom: 2px solid #cbd5e1; font-weight: bold; }
        td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
        tr:nth-child(even) { background-color: #f8fafc; }
        .total-row { font-weight: bold; font-size: 16px; background-color: #e2e8f0; }
        .total-row td { border-top: 2px solid #94a3b8; padding: 15px 12px; }
        
        @media print {
          @page { margin: 1cm; }
          body { padding: 0; }
          .print-btn { display: none; }
        }
        
        .header-actions { display: flex; justify-content: flex-end; margin-bottom: 20px; }
        .print-btn { background-color: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 14px; }
        .print-btn:hover { background-color: #2563eb; }
      </style>
    </head>
    <body>
      <div class="header-actions print-btn">
        <button class="print-btn" onclick="window.print()">YAZDIR / PDF OLARAK KAYDET</button>
      </div>
      <h1>${title}</h1>
      <div class="date">Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}</div>
      
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
            <td colspan="3" style="text-align:right;">GENEL TOPLAM:</td>
            <td style="text-align:right; color:#0f172a;">${formatMoney(totalAmount)}</td>
          </tr>
        </tbody>
      </table>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};
