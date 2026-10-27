/**
 * Kocaeli Üniversitesi Hastanesi Hemodiyaliz Ünitesi
 * Mock REST API & Database Engine Test Sunucusu
 * 
 * Bu sunucu:
 * 1. Oracle DB VW_DYZ_GUNLUK_HASTA_SEANSLARI & VW_DIYALIZ_TV_DISPLAY görünümlerini simüle eder.
 * 2. Sekreter ekranından TV Display'e tek bir standart REST API endpoint üzerinden veri akışını sağlar.
 * 3. Postman / curl veya tarayıcı üzerinden kolayca test edilebilir.
 * 
 * Çalıştırma: node server.js
 * Varsayılan Port: 3000
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

// ============================================================================
// VERİTABANI MOTORU (IN-MEMORY ORACLE ENGINE SİMÜLASYONU)
// ============================================================================
let dbSeanslar = [
  {
    HASTAADI: 'Ahmet Yıldız',
    HASTANO: '10000000001',
    HASTASEANSREFNO: 10001,
    HASTATEDAVIREFNO: 50001,
    KABULTARIHI: new Date().toISOString(),
    HASTABASVURUREFNO: 30001,
    HASTAHIZMETREFNO: 40001,
    SEANSTARIHI: new Date().toISOString(), // TRUNC(SYSDATE)
    VARDIYA: 'SABAH',
    SEANSTURU: 'HEMODIYALIZ',
    SURE: 145,
    BASVURUTURU: 'RUTIN',
    STATU: 'BEKLEMEDE',
    PRESENCE: 'GELDI',
    YATAKNO: 1,
    HEMODIYALIZ_GECMISI: 142,
    kabuliptalaciklama: ''
  },
  {
    HASTAADI: 'Mehmet Demir',
    HASTANO: '10000000002',
    HASTASEANSREFNO: 10002,
    HASTATEDAVIREFNO: 50002,
    KABULTARIHI: new Date().toISOString(),
    HASTABASVURUREFNO: 30002,
    HASTAHIZMETREFNO: 40002,
    SEANSTARIHI: new Date().toISOString(),
    VARDIYA: 'SABAH',
    SEANSTURU: 'HEMODIYALIZ',
    SURE: 145,
    BASVURUTURU: 'RUTIN',
    STATU: 'KATETER_TAKILIYOR',
    PRESENCE: 'GELDI',
    YATAKNO: 2,
    HEMODIYALIZ_GECMISI: 0, // İLK GİRİŞ (Kateter Gerekli)
    kabuliptalaciklama: ''
  },
  {
    HASTAADI: 'Ayşe Korkmaz',
    HASTANO: '10000000003',
    HASTASEANSREFNO: 10003,
    HASTATEDAVIREFNO: 50003,
    KABULTARIHI: new Date().toISOString(),
    HASTABASVURUREFNO: 30003,
    HASTAHIZMETREFNO: 40003,
    SEANSTARIHI: new Date().toISOString(),
    VARDIYA: 'SABAH',
    SEANSTURU: 'HEMODIYALIZ',
    SURE: 145,
    BASVURUTURU: 'RUTIN',
    STATU: 'YAKINI_CAGRILIYOR',
    PRESENCE: 'GELDI',
    YATAKNO: 3,
    HEMODIYALIZ_GECMISI: 88,
    kabuliptalaciklama: ''
  },
  {
    HASTAADI: 'Fatma Çelik',
    HASTANO: '10000000004',
    HASTASEANSREFNO: 10004,
    HASTATEDAVIREFNO: 50004,
    KABULTARIHI: new Date().toISOString(),
    HASTABASVURUREFNO: 30004,
    HASTAHIZMETREFNO: 40004,
    SEANSTARIHI: new Date().toISOString(),
    VARDIYA: 'SABAH',
    SEANSTURU: 'HEMODIYALIZ',
    SURE: 145,
    BASVURUTURU: 'RUTIN',
    STATU: 'BAGLANDI',
    PRESENCE: 'GELDI',
    YATAKNO: 4,
    HEMODIYALIZ_GECMISI: 215,
    kabuliptalaciklama: ''
  },
  {
    HASTAADI: 'Ali Kaya',
    HASTANO: '10000000005',
    HASTASEANSREFNO: 10005,
    HASTATEDAVIREFNO: 50005,
    KABULTARIHI: new Date().toISOString(),
    HASTABASVURUREFNO: 30005,
    HASTAHIZMETREFNO: 40005,
    SEANSTARIHI: new Date().toISOString(),
    VARDIYA: 'SABAH',
    SEANSTURU: 'HEMODIYALIZ',
    SURE: 145,
    BASVURUTURU: 'RUTIN',
    STATU: 'YARIDA_KALDI',
    PRESENCE: 'GELDI',
    YATAKNO: 5,
    HEMODIYALIZ_GECMISI: 64,
    kabuliptalaciklama: 'Tansiyon dengelenmesi amacıyla hekim kararıyla seans erken tamamlanmış olup dinlenme odasında istirahat etmektedir.'
  },
  {
    HASTAADI: 'Hatice Öztürk',
    HASTANO: '10000000006',
    HASTASEANSREFNO: 10006,
    HASTATEDAVIREFNO: 50006,
    KABULTARIHI: new Date().toISOString(),
    HASTABASVURUREFNO: 30006,
    HASTAHIZMETREFNO: 40006,
    SEANSTARIHI: new Date().toISOString(),
    VARDIYA: 'SABAH',
    SEANSTURU: 'HEMODIYALIZ',
    SURE: 145,
    BASVURUTURU: 'RUTIN',
    STATU: 'TEDAVI_SURUYOR',
    PRESENCE: 'GELDI',
    YATAKNO: 6,
    HEMODIYALIZ_GECMISI: 120,
    kabuliptalaciklama: ''
  },
  {
    HASTAADI: 'Hüseyin Arslan',
    HASTANO: '10000000007',
    HASTASEANSREFNO: 10007,
    HASTATEDAVIREFNO: 50007,
    KABULTARIHI: new Date().toISOString(),
    HASTABASVURUREFNO: 30007,
    HASTAHIZMETREFNO: 40007,
    SEANSTARIHI: new Date().toISOString(),
    VARDIYA: 'SABAH',
    SEANSTURU: 'HEMODIYALIZ',
    SURE: 145,
    BASVURUTURU: 'RUTIN',
    STATU: 'AYRILDI',
    PRESENCE: 'GELDI',
    YATAKNO: 7,
    HEMODIYALIZ_GECMISI: 95,
    kabuliptalaciklama: ''
  },
  {
    HASTAADI: 'Emine Koç',
    HASTANO: '10000000008',
    HASTASEANSREFNO: 10008,
    HASTATEDAVIREFNO: 50008,
    KABULTARIHI: new Date().toISOString(),
    HASTABASVURUREFNO: 30008,
    HASTAHIZMETREFNO: 40008,
    SEANSTARIHI: new Date().toISOString(),
    VARDIYA: 'SABAH',
    SEANSTURU: 'HEMODIYALIZ',
    SURE: 145,
    BASVURUTURU: 'RUTIN',
    STATU: 'TABURCU',
    PRESENCE: 'GELDI',
    YATAKNO: 8,
    HEMODIYALIZ_GECMISI: 180,
    kabuliptalaciklama: ''
  },
  {
    HASTAADI: 'Mustafa Aydın',
    HASTANO: '10000000009',
    HASTASEANSREFNO: 10009,
    HASTATEDAVIREFNO: 50009,
    KABULTARIHI: new Date().toISOString(),
    HASTABASVURUREFNO: 30009,
    HASTAHIZMETREFNO: 40009,
    SEANSTARIHI: new Date().toISOString(),
    VARDIYA: 'SABAH',
    SEANSTURU: 'ACIL_HEMODIYALIZ',
    SURE: 145,
    BASVURUTURU: 'ACIL_SERVIS',
    STATU: 'BAGLANDI',
    PRESENCE: 'GELDI',
    YATAKNO: 9,
    HEMODIYALIZ_GECMISI: 12,
    kabuliptalaciklama: ''
  }
];

// KVKK İsim Maskeleme Fonksiyonu
function maskFullName(fullName) {
  if (!fullName) return '***';
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return parts.map(p => {
    if (p.length <= 3) return p + '***';
    return p.substring(0, 3) + '*'.repeat(p.length - 3);
  }).join(' ');
}

// ============================================================================
// REST API VE STATİK DOSYA SUNUCUSU
// ============================================================================
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.sql': 'text/plain; charset=UTF-8',
  '.txt': 'text/plain; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  // CORS Başlıkları (Postman ve harici client istekleri için)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // --------------------------------------------------------------------------
  // TEK ANA ENDPOINT: /api/seanslar (GET & POST/PATCH)
  // emirhan.txt Madde 8 & 9: Sekreter ekranından displaye veri göndereceğimiz tek endpoint
  // --------------------------------------------------------------------------
  if (pathname === '/api/seanslar') {
    if (req.method === 'GET') {
      // 1. GET: Oracle DB View'ı (VW_DYZ_GUNLUK_HASTA_SEANSLARI) simüle ederek bugünün seanslarını döndürür
      const vardiyaFilter = parsedUrl.searchParams.get('vardiya');
      let result = [...dbSeanslar];

      if (vardiyaFilter) {
        result = result.filter(r => (r.VARDIYA || '').toUpperCase() === vardiyaFilter.toUpperCase());
      }

      // Hesaplanan alanlar ile zenginleştir
      const viewResult = result.map(row => ({
        ...row,
        MASKELI_ISIM: maskFullName(row.HASTAADI),
        ILK_GIRIS_MI: (row.HEMODIYALIZ_GECMISI === 0) ? 'EVET' : 'HAYIR',
        SEANS_SURESI_DK: row.SURE || 145
      }));

      res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
      res.end(JSON.stringify(viewResult, null, 2));
      return;
    }

    if (req.method === 'POST' || req.method === 'PATCH' || req.method === 'PUT') {
      // 2. POST / PATCH: Sekreter ekranından veya Postman'den gelen durum güncellemesi veya yeni seans kaydı
      let bodyStr = '';
      req.on('data', chunk => { bodyStr += chunk; });
      req.on('end', () => {
        try {
          const payload = JSON.parse(bodyStr || '{}');

          // Durum güncellemesi mi? (seansId veya hastaseansrefno ile)
          const seansRefNo = payload.HASTASEANSREFNO || payload.seansId || payload.seansRefNo;

          if (seansRefNo) {
            const index = dbSeanslar.findIndex(s => s.HASTASEANSREFNO == seansRefNo);
            if (index !== -1) {
              // Mevcut seansı güncelle
              if (payload.STATU !== undefined) dbSeanslar[index].STATU = payload.STATU;
              if (payload.status !== undefined) dbSeanslar[index].STATU = payload.status;
              if (payload.PRESENCE !== undefined) dbSeanslar[index].PRESENCE = payload.PRESENCE;
              if (payload.presence !== undefined) dbSeanslar[index].PRESENCE = payload.presence;
              if (payload.kabuliptalaciklama !== undefined) dbSeanslar[index].kabuliptalaciklama = payload.kabuliptalaciklama;
              if (payload.abortReason !== undefined) dbSeanslar[index].kabuliptalaciklama = payload.abortReason;
              if (payload.YATAKNO !== undefined) dbSeanslar[index].YATAKNO = payload.YATAKNO;
              if (payload.bedNo !== undefined) dbSeanslar[index].YATAKNO = payload.bedNo;

              res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
              res.end(JSON.stringify({
                success: true,
                message: `Seans #${seansRefNo} başarıyla güncellendi ve TV Display'e yansıtıldı.`,
                updatedRecord: dbSeanslar[index]
              }));
              return;
            }
          }

          // Yeni Acil / Seans Kaydı ise listeye ekle
          const newSeans = {
            HASTAADI: payload.HASTAADI || payload.hastaAdi || `${payload.firstName || 'Yeni'} ${payload.lastName || 'Hasta'}`,
            HASTANO: payload.HASTANO || payload.hastano || payload.tcNo || String(Date.now()).slice(-11),
            HASTASEANSREFNO: Number(payload.HASTASEANSREFNO || payload.seansId || Math.floor(10000 + Math.random() * 90000)),
            HASTATEDAVIREFNO: Number(payload.HASTATEDAVIREFNO || 50099),
            KABULTARIHI: new Date().toISOString(),
            HASTABASVURUREFNO: 30099,
            HASTAHIZMETREFNO: 40099,
            SEANSTARIHI: new Date().toISOString(),
            VARDIYA: payload.VARDIYA || payload.vardiya || 'SABAH',
            SEANSTURU: payload.SEANSTURU || 'HEMODIYALIZ',
            SURE: payload.SURE || 145,
            BASVURUTURU: payload.BASVURUTURU || payload.gelisTipi || 'ACIL_SERVIS',
            STATU: payload.STATU || payload.status || 'BEKLEMEDE',
            PRESENCE: payload.PRESENCE || payload.presence || 'GELDI',
            YATAKNO: payload.YATAKNO || payload.bedNo || null,
            HEMODIYALIZ_GECMISI: payload.HEMODIYALIZ_GECMISI ?? payload.dialysisHistory ?? 50,
            kabuliptalaciklama: payload.kabuliptalaciklama || payload.abortReason || ''
          };

          dbSeanslar.unshift(newSeans);

          res.writeHead(201, { 'Content-Type': 'application/json; charset=UTF-8' });
          res.end(JSON.stringify({
            success: true,
            message: `Yeni seans başarıyla oluşturuldu ve TV Display yayınına alındı.`,
            record: newSeans
          }));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=UTF-8' });
          res.end(JSON.stringify({ success: false, error: 'Geçersiz JSON payload: ' + e.message }));
        }
      });
      return;
    }
  }

  // --------------------------------------------------------------------------
  // RESET / YENİDEN YÜKLEME ENDPOINT'İ: /api/reset (Testleri sıfırlamak için)
  // --------------------------------------------------------------------------
  if (pathname === '/api/reset' && req.method === 'POST') {
    // İlk 9 varsayılan duruma sıfırlar
    res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
    res.end(JSON.stringify({ success: true, message: 'Veritabanı durumu fabrika ayarlarına sıfırlandı.' }));
    return;
  }

  // --------------------------------------------------------------------------
  // STATİK DOSYA SUNUCUSU (index.html, app.js, style.css, vb.)
  // --------------------------------------------------------------------------
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
        res.end('404 Not Found: ' + pathname);
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=UTF-8' });
        res.end('Sunucu Hatası: ' + err.code);
      }
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(`🚀 Hemodiyaliz Ünitesi Mock REST API & Web Sunucusu Aktif!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🔗 REST API Tek Endpoint: http://localhost:${PORT}/api/seanslar`);
  console.log(`🧪 Postman / Test: GET veya POST http://localhost:${PORT}/api/seanslar`);
  console.log(`================================================================`);
});
