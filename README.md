# 🏥 Hemodiyaliz Ünitesi Hasta Seans Yönetim ve Bekleme Salonu Ekran Sistemi

Kocaeli Üniversitesi Hemodiyaliz Ünitesi için geliştirilmiş; sekreter ve nöbetçi hemşire yönetim paneli ile bekleme salonundaki TV ekranlarını senkronize eden, **KVKK uyumlu**, dinamik ağ keşifli ve çok katmanlı diyaliz seans takip sistemidir.

---

## 🌟 Öne Çıkan Özellikler

### 1. 🔒 KVKK Uyumlu Hasta Listesi & Detay Yönetimi
- **Maskeli Gösterim:** Sekreter ve bekleme salonu ekranlarında hasta ad ve soyadlarının yalnızca ilk 3 harfi açık gösterilir, geri kalan harfler yıldızlanır (`BAH**** GÖK***`, `MEH*** HEN*** ÖZT***`).
- **Tıklanabilir Detay Modalı:** Sekreter veya hemşire hastanın adına tıkladığında açılan güvenli pencerede hastanın tam adı, protokol/hasta numarası, atanmış yatak numarası, vardiyası ve seans günleri eksiksiz görüntülenir ve düzenlenebilir.
- **Esnek İsim Desteği:** 3 veya 4 isimli hastalarda (ör. *Mehmet Henifi Öztekin*) TV ekranında taşma yapmayan responsive yazı boyutlandırması (`clamp`).

### 2. ⏱️ 3 Saatlik Standart Diyaliz Süreci ve Akıllı Zamanlayıcılar
- **8 Aşamalı Klinik Seans Durumu:**
  1. ⏳ Bekleme Salonunda
  2. 🔔 Odaya Çağır (Hazırlık)
  3. ⏱️ Kateter Hazırlığı (30 Dakika Geri Sayım)
  4. 🔌 Diyalize Bağla (3 Saat / 180 Dakika Standart Süre)
  5. ℹ️ Danışma / Yakını Çağrısı (Sesli Ding Uyarısı)
  6. 📋 Hekim Kararıyla Erken Durdurma
  7. 🛏️ Dinlenme / Gözlem
  8. ✅ Seans Tamamlandı / Taburcu
- **Süre Esnetme:** Seans devam ederken hekim/hemşire kararıyla tek tıkla `+15 dk`, `+30 dk` veya `-15 dk` süre revizyonu.

### 3. 👥 Çoklu Kullanıcı ve Hafta Sonu Nöbetçi Hemşire Desteği
Cumartesi günleri sekreter çalışmadığı için bağımsız hemşire rolü tanımlanmıştır:
- **Yönetici (Admin):** `admin` / `1234` (Kullanıcı oluşturma, silme, şifre sıfırlama, tam yetki)
- **Sekreter:** `sekreter` / `1234` (Hafta içi seans ve hasta kabul yönetimi)
- **Hemşire:** `hemsire` / `1234` (Hafta sonu/cumartesi nöbet ve seans yönetimi)

### 4. 🌐 Cihaz Bağımsızlığı & Otomatik IP Keşfi (Flask Backend)
- Modemin dağıttığı yerel IP değişse bile Flask sunucusu (`app.py`) yerel ağ adaptörlerini otomatik tarar.
- Aynı Wi-Fi / LAN ağındaki Akıllı TV, tablet, telefon veya diğer bilgisayarlar manuel IP yapılandırmasına gerek kalmadan sisteme bağlanabilir.

---

## 🖥️ Ekranlar

| Ekran | Açıklama | URL |
|---|---|---|
| **Sekreter & Hemşire Paneli** | Hasta kabulü, acil hasta girişi, gün/yatak değişimi, seans başlatma | `http://localhost:5000/sekreter.html` |
| **Bekleme Salonu TV** | Büyük puntolu, sesli uyarı destekli, seans geri sayımlı TV ekranı | `http://localhost:5000/display.html?tv=1` |
| **Genel Bilgi Ekranı** | Özet seans ve hasta listesi | `http://localhost:5000/` |

---

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- **Python 3.8+** (Flask, Flask-CORS) veya **Node.js 18+**
- Modern bir web tarayıcısı (Chrome, Edge, Firefox)

### 1. Adım: Python Kütüphanelerini Yükleyin
```bash
pip install flask flask-cors
```

### 2. Adım: Sunucuyu Başlatın

#### Kolay Yöntem (Windows):
Proje dizinindeki `SUNUCUYU_BASLAT.bat` dosyasına çift tıklayarak tek adımda başlatabilirsiniz.

#### Komut Satırı ile:
```bash
python app.py
```

Sunucu açıldığında konsolda yerel ağdaki TV ve tabletlerin erişebileceği hazır IP bağlantıları listelenir:
```text
==================================================================
🌐 BU BİLGİSAYARDAN AÇMAK İÇİN:
   🖥️  Sekreter Paneli : http://localhost:5000/sekreter.html
   📺 TV Bekleme Ekranı: http://localhost:5000/display.html?tv=1

📱 YEREL AĞDAKİ DİĞER CİHAZLAR (TV, Tablet, PC):
   🖥️  Sekreter: http://192.168.1.X:5000/sekreter.html
   📺 TV 1   : http://192.168.1.X:5000/display.html?tv=1
==================================================================
```

---

## 📁 Proje Dizin Yapısı

```text
sezen-diyaliz/
├── app.py                      # Python Flask REST API & Otomatik Ağ Sunucusu
├── app.js                      # İstemci tarafı seans döngüsü, KVKK maskeleme & UI yönetimi
├── database_engine.js          # Node.js SQLite / SQL yansıma motoru
├── server.js                   # Node.js Express alternatif sunucu
├── diyaliz_veritabani.sqlite   # Kalıcı SQLite veritabanı (Hastalar & Kullanıcılar)
├── diyaliz_oracle_db.sql       # Oracle SQL veri aktarım ve yedek şeması
├── silinen_hastalar.sqlite     # Güvenli hasta arşiv/silinenler veritabanı
├── display.html                # TV Bekleme Salonu Ekranı
├── sekreter.html               # Sekreter & Hemşire Yönetim Konsolu
├── index.html                  # Genel Bilgilendirme Ekranı
├── style.css                   # Responsive ve büyük TV tipografi stilleri
├── SUNUCUYU_BASLAT.bat         # Tek tıkla arka plan başlatıcı
├── SUNUCUYU_DURDUR.bat         # Sunucuyu güvenli durdurma betiği
└── README.md                   # Proje dokümantasyonu
```

---

## 🔒 Güvenlik & KVKK Notu
Bu yazılım sağlık verilerinin korunması amacıyla hasta isimlerini yalnızca maskeli olarak genel ekranlara yansıtır. Detaylı hasta kimlik bilgileri sadece yetkili kullanıcıların (Admin, Sekreter, Hemşire) oturum açması durumunda görüntülenebilir.
