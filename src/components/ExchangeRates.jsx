import React, { useState } from 'react';
import { useBudget } from '../context/BudgetContext';
import { RefreshCw, CheckSquare, Square, Check, X, AlertTriangle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const ExchangeRates = () => {
  const { exchangeRates, updateExchangeRate, getDebts, addTransaction } = useBudget();
  const [editingRate, setEditingRate] = useState(null);
  const [tempRate, setTempRate] = useState('');
  
  // Kur farkı hesaplamaları için
  const [showKurFarkiModal, setShowKurFarkiModal] = useState(false);
  const [kurFarkiItems, setKurFarkiItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  // Kapanan hesapların temizliği için
  const [showCleanupModal, setShowCleanupModal] = useState(false);
  const [cleanupItems, setCleanupItems] = useState([]);

  const handleEditClick = (rateObj) => {
    setEditingRate(rateObj.assetType);
    setTempRate(rateObj.rate.toString());
  };

  const handleSaveRate = (assetType) => {
    if (tempRate && !isNaN(parseFloat(tempRate))) {
      updateExchangeRate(assetType, tempRate);
    }
    setEditingRate(null);
  };

  const handleCalculateKurFarki = () => {
    const debts = getDebts();
    const items = [];

    debts.forEach(d => {
      let expectedTL = 0;
      let hasAssets = false;

      // Hesaplama
      Object.keys(d.assets).forEach(aType => {
        if (aType === 'TL') {
          expectedTL += d.assets[aType];
        } else {
          hasAssets = true;
          const rateObj = exchangeRates.find(r => r.assetType === aType);
          const currentRate = rateObj ? rateObj.rate : 1; 
          expectedTL += (d.assets[aType] * currentRate);
        }
      });

      if (hasAssets) {
        const diff = expectedTL - d.netAmount;
        // Sadece 1 TL den büyük farkları gösterelim
        if (Math.abs(diff) > 1) {
          items.push({
            person: d.person,
            currentAmount: d.netAmount,
            expectedAmount: expectedTL,
            difference: diff,
            assets: d.assets
          });
        }
      }
    });

    setKurFarkiItems(items);
    setSelectedItems(items.map(i => i.person)); 
    setShowKurFarkiModal(true);
  };

  const handleCalculateCleanup = () => {
    const debts = getDebts();
    const items = [];

    debts.forEach(d => {
      // Sadece döviz/altın bakiyesi tamamen SIFIR olanları bul
      const nonTlAssets = Object.keys(d.assets).filter(k => k !== 'TL');
      const hasActiveFx = nonTlAssets.some(k => Math.abs(d.assets[k]) > 0.001);

      if (!hasActiveFx) {
        const tlAsset = d.assets['TL'] || 0;
        const diff = d.netAmount - tlAsset;

        if (Math.abs(diff) > 1) {
          items.push({
            person: d.person,
            difference: diff, // diff < 0 ise Kar (Gelir), diff > 0 ise Zarar (Gider)
            tlAsset: tlAsset,
            netAmount: d.netAmount
          });
        }
      }
    });

    setCleanupItems(items);
    setShowCleanupModal(true);
  };

  const toggleSelection = (person) => {
    if (selectedItems.includes(person)) {
      setSelectedItems(selectedItems.filter(p => p !== person));
    } else {
      setSelectedItems([...selectedItems, person]);
    }
  };

  const applyKurFarki = () => {
    const itemsToApply = kurFarkiItems.filter(i => selectedItems.includes(i.person));
    
    itemsToApply.forEach(item => {
      const isIncrease = item.difference > 0;
      
      addTransaction({
        id: uuidv4(),
        type: isIncrease ? 'debt_given' : 'debt_taken',
        amount: Math.abs(item.difference).toFixed(2),
        date: new Date().toISOString().split('T')[0],
        title: 'Kur Farkı Değerlemesi',
        category: 'Kur Farkı',
        accountId: null, 
        person: item.person,
        notes: `Güncel kur üzerinden değerleme yapıldı.`,
        assetType: 'TL',
        assetAmount: 0,
        assetRate: 0,
        addedBy: 'system'
      });
    });

    setShowKurFarkiModal(false);
  };

  const applyCleanup = () => {
    cleanupItems.forEach(item => {
      const isIncome = item.difference < 0; 
      const absDiff = Math.abs(item.difference).toFixed(2);
      const dateStr = new Date().toISOString().split('T')[0];

      // 1. Gelir/Gider Tablosuna Yansıt 
      addTransaction({
        id: uuidv4(),
        type: isIncome ? 'income' : 'expense',
        amount: absDiff,
        date: dateStr,
        title: `${item.person} - Gerçekleşen Kur Farkı`,
        category: 'Kur Farkı',
        accountId: null, 
        notes: `Döviz hesabı kapandığında oluşan kur farkı (Otomatik Sistem İşlemi)`,
        addedBy: 'system'
      });

      // 2. Cari Hesabı Dengele 
      addTransaction({
        id: uuidv4(),
        type: isIncome ? 'debt_given' : 'debt_taken',
        amount: absDiff,
        date: dateStr,
        title: 'Kur Farkı Cari Dengeleme',
        category: 'Kur Farkı',
        accountId: null,
        person: item.person,
        notes: `Gelir/Gider tablosuna aktarılan kur farkının cari hesaptan düşülmesi`,
        assetType: 'TL',
        assetAmount: 0,
        assetRate: 0,
        addedBy: 'system'
      });
    });

    setShowCleanupModal(false);
  };

  const formatMoney = (val) => {
    return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto pb-24">
      <h2 className="text-xl font-bold mb-6 text-main">Döviz ve Altın Kurları</h2>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-3 text-sm font-semibold text-gray-600">Birim</th>
              <th className="p-3 text-sm font-semibold text-gray-600">Güncel Kur (₺)</th>
              <th className="p-3 text-sm font-semibold text-gray-600">Son Güncelleme</th>
              <th className="p-3 text-sm font-semibold text-gray-600 text-center">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {exchangeRates.map(rate => (
              <tr key={rate.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                <td className="p-3 font-semibold text-gray-800">{rate.assetType}</td>
                <td className="p-3">
                  {editingRate === rate.assetType ? (
                    <input
                      type="number"
                      step="0.01"
                      className="border border-blue-300 rounded px-2 py-1 w-24 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={tempRate}
                      onChange={(e) => setTempRate(e.target.value)}
                      autoFocus
                    />
                  ) : (
                    <span className="font-mono text-gray-700">{formatMoney(rate.rate)} ₺</span>
                  )}
                </td>
                <td className="p-3 text-xs text-gray-500">
                  {new Date(rate.lastUpdated).toLocaleDateString('tr-TR')} {new Date(rate.lastUpdated).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
                </td>
                <td className="p-3 text-center">
                  {editingRate === rate.assetType ? (
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleSaveRate(rate.assetType)} className="text-green-600 hover:text-green-800">
                        <Check size={18} />
                      </button>
                      <button onClick={() => setEditingRate(null)} className="text-red-500 hover:text-red-700">
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleEditClick(rate)}
                      className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                    >
                      Düzenle
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 mt-6">
        <h3 className="font-semibold text-blue-800 flex items-center gap-2 mb-2">
          <RefreshCw size={18} />
          Kur Farklarını Yansıt (Açık Hesaplar İçin)
        </h3>
        <p className="text-sm text-blue-600 mb-4">
          Yukarıdaki kurları güncelledikten sonra, döviz veya altın bazında borcu/alacağı <strong>devam eden</strong> kişilerin cari bakiyelerine kur farkı işlemlerini toplu olarak yansıtabilirsiniz. (Gelir/Gider tablonuzu etkilemez, sadece borç/alacak bilançosunu günceller).
        </p>
        <button 
          onClick={handleCalculateKurFarki}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors w-full sm:w-auto"
        >
          Açık Hesap Kur Farklarını Hesapla
        </button>
      </div>

      <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-emerald-800 flex items-center gap-2 mb-2">
          <CheckSquare size={18} />
          Kapanan Döviz/Altın Hesaplarını Temizle (Gelir/Gidere Aktar)
        </h3>
        <p className="text-sm text-emerald-600 mb-4">
          Döviz/Altın bakiyesi tamamen ödenip <strong>0 (Sıfır)</strong> olan kişilerin, geçmişteki kur dalgalanmalarından dolayı oluşan açık TL bakiyelerini sıfırlar. Aradaki farkı aylık <strong>Gelir veya Gider</strong> grafiklerinize "Gerçekleşen Kur Farkı Kar/Zararı" olarak işler.
        </p>
        <button 
          onClick={handleCalculateCleanup}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors w-full sm:w-auto"
        >
          Kapanan Hesapları Bul ve Temizle
        </button>
      </div>

      {/* Kur Farkı Modal */}
      {showKurFarkiModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
              <h2 className="font-bold text-lg text-gray-800">Kur Farkı Değerlemesi (Açık Hesaplar)</h2>
              <button onClick={() => setShowKurFarkiModal(false)} className="text-gray-500 hover:text-gray-800">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1">
              {kurFarkiItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500 flex flex-col items-center">
                  <CheckSquare size={48} className="text-green-500 mb-4 opacity-50" />
                  <p>Tüm bakiyeler güncel. Herhangi bir kur farkı yansıtılmasına gerek yok.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg mb-4 text-sm">
                    <AlertTriangle size={20} className="shrink-0" />
                    <p>Aşağıdaki kişilerin aktif döviz/altın hesaplarında kur değişiminden kaynaklı farklar tespit edildi. Yansıtmak istediklerinizi seçip kaydedebilirsiniz.</p>
                  </div>
                  
                  <div className="space-y-3">
                    {kurFarkiItems.map(item => (
                      <div 
                        key={item.person} 
                        onClick={() => toggleSelection(item.person)}
                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${selectedItems.includes(item.person) ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}
                      >
                        <div className="mr-4 text-blue-500">
                          {selectedItems.includes(item.person) ? <CheckSquare size={20} /> : <Square size={20} className="text-gray-300" /> }
                        </div>
                        
                        <div className="flex-1">
                          <p className="font-bold text-gray-800">{item.person}</p>
                          <p className="text-xs text-gray-500">
                            Aktif Varlıklar: {Object.keys(item.assets).filter(a => a !== 'TL' && Math.abs(item.assets[a]) > 0.001).map(a => `${item.assets[a]} ${a}`).join(', ')}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <div className={`font-bold ${item.difference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {item.difference > 0 ? '+' : ''}{formatMoney(item.difference)} ₺
                          </div>
                          <div className="text-xs text-gray-400">
                            Cari Bakiye Etkisi
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            
            {kurFarkiItems.length > 0 && (
              <div className="p-4 border-t bg-gray-50 rounded-b-xl flex justify-end items-center gap-2">
                <button 
                  onClick={() => setShowKurFarkiModal(false)}
                  className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors"
                >
                  İptal
                </button>
                <button 
                  onClick={applyKurFarki}
                  disabled={selectedItems.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  Seçilenlere Uygula
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cleanup Modal */}
      {showCleanupModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
              <h2 className="font-bold text-lg text-gray-800">Gerçekleşen Kur Farkları (Hesap Kapatma)</h2>
              <button onClick={() => setShowCleanupModal(false)} className="text-gray-500 hover:text-gray-800">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1">
              {cleanupItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500 flex flex-col items-center">
                  <CheckSquare size={48} className="text-green-500 mb-4 opacity-50" />
                  <p>Harika! Döviz hesabı kapanmış ancak TL bakiyesi havada kalmış kimse yok.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 p-3 rounded-lg mb-4 text-sm">
                    <CheckSquare size={20} className="shrink-0" />
                    <p>Aşağıdaki kişilerin döviz borcu/alacağı sıfırlanmış ancak kur farkından dolayı TL bakiyeleri açık kalmış. Onaylarsanız bu tutarlar cari hesaptan silinip Gelir/Gider tablonuza işlenecek.</p>
                  </div>
                  
                  <div className="space-y-3">
                    {cleanupItems.map(item => (
                      <div 
                        key={item.person} 
                        className="flex items-center p-3 rounded-lg border bg-white border-gray-200"
                      >
                        <div className="flex-1">
                          <p className="font-bold text-gray-800">{item.person}</p>
                          <p className="text-xs text-gray-500">
                            Askıda Kalan Tutar: {formatMoney(item.netAmount)} ₺
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <div className={`font-bold ${item.difference < 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {item.difference < 0 ? '+ (Gelir)' : '- (Gider)'} {formatMoney(Math.abs(item.difference))} ₺
                          </div>
                          <div className="text-xs text-gray-400">
                            Gelir/Gider Etkisi
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            
            {cleanupItems.length > 0 && (
              <div className="p-4 border-t bg-gray-50 rounded-b-xl flex justify-end items-center gap-2">
                <button 
                  onClick={() => setShowCleanupModal(false)}
                  className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors"
                >
                  İptal
                </button>
                <button 
                  onClick={applyCleanup}
                  className="px-4 py-2 bg-emerald-600 text-white font-medium hover:bg-emerald-700 rounded-lg transition-colors"
                >
                  Gelir/Gidere Aktar ve Temizle
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExchangeRates;
