import React from 'react';
import { X, Book, PlusCircle, CreditCard, ArrowRightLeft, HandCoins, Users, ShieldAlert } from 'lucide-react';

const GuideModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-xl flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)' }}>
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-color)' }}>
          <h2 className="text-xl font-bold flex items-center gap-2 text-primary">
            <Book size={24} /> Kullanım Kılavuzu
          </h2>
          <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-text opacity-70 hover:opacity-100">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-6 text-text" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
          
          <section>
            <h3 className="font-bold text-lg text-primary flex items-center gap-2 mb-2">
              <PlusCircle size={18} /> 1. İşlem Eklemek (Gelir / Gider)
            </h3>
            <p className="mb-2">
              Ortadaki mavi <strong>(+)</strong> butonuna basarak yeni bir işlem girebilirsiniz. Uygulama size 4 ana seçenek sunar:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Gider:</strong> Market, Fatura, Kira gibi harcamalarınız. "Nereden ödenecek?" kısmından harcamayı hangi hesaptan veya karttan yaptığınızı seçmelisiniz.</li>
              <li><strong>Gelir:</strong> Maaş, Prim vb. gelirleriniz. "Para Hangi Hesaba Girecek?" diyerek gelirin nereye yattığını seçmelisiniz.</li>
              <li><strong>Borç / Alacak:</strong> Birine borç verdiğinizde veya aldığınızda kullanın. Verdiğiniz kişiyi de yazarsanız uygulama "Cari/Borç" defterini otomatik tutar!</li>
              <li><strong>Transfer / Virman:</strong> Kendi hesaplarınız arasındaki para transferleridir. (Örn: Ziraat hesabımdan Nakit cüzdanıma 500 TL çektim).</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-lg text-primary flex items-center gap-2 mb-2">
              <CreditCard size={18} /> 2. Hesaplar (Banka, Nakit, Kredi Kartı)
            </h3>
            <p className="mb-2">
              Banka hesaplarınızı, nakit cüzdanınızı ve kredi kartlarınızı ayrı ayrı takip edebilirsiniz. Yeni işlem eklerken direkt ekran üzerinden <strong>"+ Yeni Hesap Ekle"</strong> diyerek hızlıca hesap tanımlayabilirsiniz. Kredi kartı harcaması girdiğinizde kartınızın borcu artarken, karta ödeme yaptığınızda (Transfer menüsünden) borç kapanır.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-lg text-primary flex items-center gap-2 mb-2">
              <ArrowRightLeft size={18} /> 3. Faturalar ve Sabit Giderler
            </h3>
            <p className="mb-2">
              Ayarlar bölümünden değil, doğrudan uygulamanın içinden Sabit Faturalarınızı (Örn: Elektrik, İnternet) ekleyebilirsiniz. Fatura günü yaklaştığında <strong>Ana Ekranınızda</strong> "Yaklaşan Ödemeler" kısmında kırmızı renkli olarak hatırlatılır. Faturayı ödediğinizde tek tuşla "Öde" diyerek bakiyenizden düşülmesini sağlayabilirsiniz.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-lg text-primary flex items-center gap-2 mb-2">
              <HandCoins size={18} /> 4. Kim Kiminle Ortak? (Ev / Şahsi)
            </h3>
            <p className="mb-2">
              Harcama yaparken "Ev/Ortak" veya "Şahsi" olarak işaretleyebilirsiniz. Bu sayede ay sonunda "Evin ortak gideri ne kadar oldu?" veya "Sadece şahsi harcamalarım ne tuttu?" diyerek net bir analiz yapabilirsiniz.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-lg text-primary flex items-center gap-2 mb-2">
              <Users size={18} /> 5. Profiller ve Şifreleme
            </h3>
            <p className="mb-2">
              Ayarlar kısmından eşinizi veya çocuklarınızı farklı bir "Kullanıcı" olarak ekleyebilirsiniz. Her kullanıcının kendi 4 haneli PIN şifresi olabilir. Böylece herkes kendi şifresiyle girip ortak bütçeye kendi kaydını düşebilir. (Admin olan siz, tüm işlemleri ve şifreleri yönetebilirsiniz).
            </p>
          </section>

          <section className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="font-bold text-lg text-blue-600 dark:text-blue-400 flex items-center gap-2 mb-2">
              <ShieldAlert size={18} /> Verilerim Nerede Saklanıyor?
            </h3>
            <p>
              Bu uygulama <strong>tamamen sizin cihazınızda (çevrimdışı)</strong> çalışır! Hiçbir harcamanız, hesabınız veya bilginiz internetteki bir sunucuya gitmez. Her şey telefonunuzun veya bilgisayarınızın kendi hafızasındadır. Gizliliğiniz %100 güvendedir. 
              (Ancak tarayıcı verilerinizi tamamen sıfırlarsanız verileriniz silinebilir, ayarlar menüsünden düzenli olarak <strong>Yedek Almanızı</strong> tavsiye ederiz).
            </p>
          </section>

        </div>
        
        {/* Footer */}
        <div className="p-4 border-t" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-color)' }}>
          <button onClick={onClose} className="btn btn-primary w-full py-3 font-bold text-lg rounded-xl">
            Anladım, Kapat
          </button>
        </div>

      </div>
    </div>
  );
};

export default GuideModal;
