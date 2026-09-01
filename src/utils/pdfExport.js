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

export const openFinancialPdf = (isDetailed, dateRange, data) => {
  const printWindow = window.open('', '_blank');
  const formatMoney = (amount) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  
  const title = isDetailed ? 'Detaylı Finansal Rapor' : 'Özet Finansal Rapor';
  
  const {
    totalCashAndBank, cashAndBankAccounts,
    totalInvestments, investmentAccounts,
    sumReceivables, receivablesDetail,
    totalAssets,
    totalCCDebt, creditCardAccounts,
    sumPayables, payablesDetail,
    totalLiabilities,
    equity,
    periodIncome, incomeByCategory,
    periodExpense, expenseByCategory,
    periodNetIncome
  } = data;

  const renderSection = (title, items, total, colorClass = '') => {
    let html = `
      <div class="section-block">
        <div class="section-header ${colorClass}">
          <span>${title}</span>
          <span>${formatMoney(total)}</span>
        </div>
    `;
    if (isDetailed && items && items.length > 0) {
      html += `<div class="detail-list">`;
      items.forEach(item => {
        html += `
          <div class="detail-item">
            <span>${item.name}</span>
            <span>${formatMoney(item.amount)}</span>
          </div>
        `;
      });
      html += `</div>`;
    }
    html += `</div>`;
    return html;
  };

  const html = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        body { 
          font-family: 'Inter', system-ui, sans-serif; 
          padding: 30px 40px; 
          color: #1e293b; 
          background-color: #fff;
          margin: 0;
          font-size: 13px;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #0f172a;
          padding-bottom: 15px;
          margin-bottom: 30px;
        }
        h1 { 
          color: #0f172a; 
          margin: 0 0 5px 0; 
          font-size: 24px;
          font-weight: 700;
          letter-spacing: -0.5px;
          text-transform: uppercase;
        }
        .date { 
          color: #64748b; 
          font-size: 13px; 
          font-weight: 500;
        }
        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
        }
        .column-title {
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
          border-bottom: 1px solid #cbd5e1;
          padding-bottom: 8px;
          margin-bottom: 15px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .section-block {
          margin-bottom: 15px;
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          font-weight: 600;
          padding: 6px 0;
          border-bottom: 1px solid #e2e8f0;
          font-size: 13px;
        }
        .detail-list {
          padding: 4px 0 4px 15px;
        }
        .detail-item {
          display: flex;
          justify-content: space-between;
          padding: 3px 0;
          color: #64748b;
          font-size: 12px;
          border-bottom: 1px dashed #f1f5f9;
        }
        .detail-item:last-child { border-bottom: none; }
        
        .summary-row {
          display: flex;
          justify-content: space-between;
          font-weight: 700;
          padding: 10px 12px;
          background-color: #f8fafc;
          border-radius: 4px;
          margin-top: 5px;
          font-size: 14px;
        }
        
        .text-success { color: #059669; }
        .text-danger { color: #e11d48; }
        .text-primary { color: #0284c7; }
        
        .note {
          margin-top: 40px;
          padding: 15px;
          background-color: #f8fafc;
          border-left: 3px solid #cbd5e1;
          font-size: 11px;
          color: #64748b;
          line-height: 1.5;
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
      </style>
    </head>
    <body>
      <button class="print-btn" onclick="window.print()">🖨️ YAZDIR / PDF İNDİR</button>
      
      <div class="header">
        <h1>${title}</h1>
        <div class="date">Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}</div>
      </div>
      
      <div class="grid">
        <!-- SOL KOLON: BİLANÇO -->
        <div>
          <div class="column-title">Bilanço (Mevcut Durum)</div>
          
          <div style="color: #64748b; font-weight: 700; font-size: 11px; margin-bottom: 8px;">VARLIKLAR (AKTİF)</div>
          ${renderSection('Nakit ve Bankalar', cashAndBankAccounts, totalCashAndBank)}
          ${renderSection('Birikimler ve Yatırımlar', investmentAccounts, totalInvestments)}
          ${renderSection('Alacaklar (Cari)', receivablesDetail, sumReceivables, 'text-success')}
          
          <div class="summary-row">
            <span>Toplam Varlıklar</span>
            <span class="text-primary">${formatMoney(totalAssets)}</span>
          </div>
          
          <div style="color: #64748b; font-weight: 700; font-size: 11px; margin-top: 25px; margin-bottom: 8px;">YÜKÜMLÜLÜKLER (PASİF)</div>
          ${renderSection('Kredi Kartı Borçları', creditCardAccounts, Math.abs(totalCCDebt), 'text-danger')}
          ${renderSection('Borçlar (Cari)', payablesDetail, sumPayables, 'text-danger')}
          
          <div class="summary-row">
            <span>Toplam Yükümlülükler</span>
            <span class="text-danger">${formatMoney(totalLiabilities)}</span>
          </div>
          
          <div style="color: #64748b; font-weight: 700; font-size: 11px; margin-top: 25px; margin-bottom: 8px;">ÖZKAYNAKLAR</div>
          <div class="summary-row" style="background-color: #eff6ff;">
            <span style="color: #1e3a8a;">Net Varlık (Özkaynak)</span>
            <span style="color: #1e3a8a;">${formatMoney(equity)}</span>
          </div>
        </div>

        <!-- SAĞ KOLON: GELİR TABLOSU -->
        <div>
          <div class="column-title">Gelir Tablosu (${dateRange})</div>
          
          <div style="color: #64748b; font-weight: 700; font-size: 11px; margin-bottom: 8px;">GELİRLER</div>
          ${renderSection('Faaliyet Gelirleri', Object.entries(incomeByCategory).map(([n,a])=>({name:n,amount:a})), periodIncome, 'text-success')}
          
          <div class="summary-row">
            <span>Toplam Gelirler</span>
            <span class="text-success">${formatMoney(periodIncome)}</span>
          </div>
          
          <div style="color: #64748b; font-weight: 700; font-size: 11px; margin-top: 25px; margin-bottom: 8px;">GİDERLER</div>
          ${renderSection('Faaliyet Giderleri', Object.entries(expenseByCategory).map(([n,a])=>({name:n,amount:a})), periodExpense, 'text-danger')}
          
          <div class="summary-row">
            <span>Toplam Giderler</span>
            <span class="text-danger">${formatMoney(periodExpense)}</span>
          </div>
          
          <div style="color: #64748b; font-weight: 700; font-size: 11px; margin-top: 25px; margin-bottom: 8px;">SONUÇ</div>
          <div class="summary-row" style="background-color: ${periodNetIncome >= 0 ? '#f0fdf4' : '#fff1f2'}">
            <span style="color: ${periodNetIncome >= 0 ? '#15803d' : '#be123c'}">${periodNetIncome >= 0 ? 'Net Kar' : 'Net Zarar'}</span>
            <span style="color: ${periodNetIncome >= 0 ? '#15803d' : '#be123c'}">${formatMoney(periodNetIncome)}</span>
          </div>
          
          <div class="note">
            <strong>Not:</strong> Bilanço tablosu güncel anlık durumu (kasa, banka, toplam alacak/borç) yansıtırken; Gelir tablosu sadece seçili olan "${dateRange}" dönemi içindeki gelir ve gider işlemlerini kapsar. Borç alıp verme işlemleri gelir tablosuna dahil edilmez, bilançoda (Cari) gösterilir.
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

export const openDetailedReportPdf = (dateRange, person, category, totalIncome, totalExpense, filteredTxs) => {
  const printWindow = window.open('', '_blank');
  const formatMoney = (amount) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  
  let tableRows = '';
  filteredTxs.forEach(t => {
    const d = new Date(t.date).toLocaleDateString('tr-TR');
    const typeLabel = t.type === 'expense' ? 'Gider' : t.type === 'income' ? 'Gelir' : t.type === 'transfer' ? 'Transfer' : t.type === 'debt_given' ? 'Borç Verildi' : 'Borç Alındı';
    
    let amountStr = '';
    let amountColor = '#334155';
    if (t.type === 'expense' || t.type === 'debt_given') {
      amountStr = '-' + formatMoney(t.amount);
      amountColor = '#e11d48';
    } else if (t.type === 'income' || t.type === 'debt_taken') {
      amountStr = '+' + formatMoney(t.amount);
      amountColor = '#059669';
    } else {
      amountStr = formatMoney(t.amount);
    }

    tableRows += `
      <tr>
        <td class="date-col">${d}</td>
        <td class="cat-col">${t.category || '-'}</td>
        <td>${typeLabel}</td>
        <td>${t.person || '-'}</td>
        <td>${t.title || '-'}</td>
        <td style="text-align:right; font-weight:500; color:${amountColor};">${amountStr}</td>
      </tr>
    `;
  });

  const html = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <title>Aile Bütçesi Detaylı Rapor</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
      <style>
        body { 
          font-family: 'Inter', system-ui, -apple-system, sans-serif; 
          padding: 30px 40px; 
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
          margin-bottom: 24px;
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
          font-size: 12px; 
          font-weight: 500;
        }
        .filters {
          display: flex;
          gap: 15px;
          margin-bottom: 15px;
          font-size: 12px;
          color: #475569;
        }
        .filters span { font-weight: 600; color: #0f172a; }
        
        .totals-box {
          display: flex;
          gap: 30px;
          padding: 15px 20px;
          background-color: #f8fafc;
          border-radius: 8px;
          margin-bottom: 25px;
          border: 1px solid #e2e8f0;
        }
        .totals-box div { font-size: 13px; color: #475569; }
        .totals-box strong { display: block; font-size: 18px; margin-top: 4px; }
        .tot-in { color: #059669; }
        .tot-out { color: #e11d48; }

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
          border-bottom: 1px solid #1e293b;
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
        <h1>Aile Bütçesi Detaylı Rapor</h1>
        <div class="date">Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}</div>
      </div>
      
      <div class="filters">
        <div>Tarih Aralığı: <span>${dateRange}</span></div>
        <div>Kişi: <span>${person}</span></div>
        <div>Kategori: <span>${category}</span></div>
      </div>
      
      <div class="totals-box">
        <div>Toplam Gelir: <strong class="tot-in">${formatMoney(totalIncome)}</strong></div>
        <div>Toplam Gider: <strong class="tot-out">${formatMoney(totalExpense)}</strong></div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th style="width:10%">Tarih</th>
            <th style="width:15%">Kategori</th>
            <th style="width:15%">İşlem Türü</th>
            <th style="width:15%">Kişi</th>
            <th style="width:30%">Açıklama</th>
            <th style="width:15%; text-align:right;">Tutar</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};
