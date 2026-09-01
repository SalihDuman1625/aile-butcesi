import re

with open('src/components/Settings.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add an Upload icon to the imports
if "Upload" not in code:
    code = code.replace("Download, Trash2", "Download, Upload, Trash2")
else:
    # If it's already imported, good.
    pass

import_function = """
  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.transactions && data.accounts) {
          localStorage.setItem('budget_transactions', JSON.stringify(data.transactions));
          localStorage.setItem('budget_accounts', JSON.stringify(data.accounts));
          if (data.bills) localStorage.setItem('budget_bills', JSON.stringify(data.bills));
          if (data.users) localStorage.setItem('budget_users', JSON.stringify(data.users));
          alert('Yedek başarıyla yüklendi! Uygulama yeniden başlatılacak.');
          window.location.reload();
        } else {
          alert('Geçersiz yedekleme dosyası formatı!');
        }
      } catch (err) {
        alert('Dosya okunurken bir hata oluştu: ' + err.message);
      }
    };
    reader.readAsText(file);
  };
"""

# Insert the handleImportData function right after handleExportData
code = code.replace(
    "  const handleExportData = () => {",
    import_function + "\n  const handleExportData = () => {"
)

# Insert the Upload button right after the Download button
download_btn = "<button onClick={handleExportData} className=\"btn\" style={{ backgroundColor: '#10B981', color: 'white' }}>\n          Tüm Veriyi İndir (Yedekle)\n        </button>"

upload_btn = """
        <label className="btn mt-2 cursor-pointer flex justify-center items-center gap-2" style={{ backgroundColor: '#3B82F6', color: 'white' }}>
          <Upload size={18} /> Yedeği Geri Yükle
          <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleImportData} />
        </label>
"""

code = code.replace(download_btn, download_btn + upload_btn)

with open('src/components/Settings.jsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Settings updated!")
