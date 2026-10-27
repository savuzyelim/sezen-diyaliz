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
const dbEngine = require('./database_engine');

const PORT = process.env.PORT || 3000;

// Veritabanı motorunu başlat
dbEngine.init();

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
  // emirhan.txt Madde 15, 18, 23: Database Engine entegrasyonu
  // --------------------------------------------------------------------------
  if (pathname === '/api/seanslar') {
    if (req.method === 'GET') {
      // 1. GET: Database Engine üzerinden VW_DYZ_GUNLUK_HASTA_SEANSLARI view'ını yürütür
      const vardiyaFilter = parsedUrl.searchParams.get('vardiya');
      dbEngine.executeViewDyzGunlukHastaSeanslari(vardiyaFilter).then(rows => {
        // Hesaplanan alanlar ile zenginleştir
        const viewResult = rows.map(row => ({
          ...row,
          MASKELI_ISIM: maskFullName(row.HASTAADI),
          ILK_GIRIS_MI: (row.HEMODIYALIZ_GECMISI === 0) ? 'EVET' : 'HAYIR',
          SEANS_SURESI_DK: row.SURE || 145
        }));

        res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
        res.end(JSON.stringify(viewResult, null, 2));
      }).catch(err => {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=UTF-8' });
        res.end(JSON.stringify({ error: err.message }));
      });
      return;
    }

    if (req.method === 'POST' || req.method === 'PATCH' || req.method === 'PUT') {
      // 2. POST / PATCH: Sekreter ekranından veya Postman'den gelen durum güncellemesi veya yeni seans kaydı
      let bodyStr = '';
      req.on('data', chunk => { bodyStr += chunk; });
      req.on('end', async () => {
        try {
          const payload = JSON.parse(bodyStr || '{}');
          const seansRefNo = payload.HASTASEANSREFNO || payload.seansId || payload.seansRefNo;

          if (seansRefNo) {
            // Prosedür çağrısı: spDurumDegistir
            const updated = await dbEngine.spDurumDegistir(
              seansRefNo,
              payload.STATU || payload.status,
              payload.PRESENCE || payload.presence,
              payload.kabuliptalaciklama !== undefined ? payload.kabuliptalaciklama : payload.abortReason,
              payload.YATAKNO !== undefined ? payload.YATAKNO : payload.bedNo
            );

            if (updated) {
              res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
              res.end(JSON.stringify({
                success: true,
                message: `Seans #${seansRefNo} Database Engine tarafından başarıyla güncellendi ve TV Display'e yansıtıldı.`,
                updatedRecord: updated
              }));
              return;
            }
          }

          // Yeni Acil / Seans Kaydı ise Database Engine prosedürünü çalıştır
          const newSeans = await dbEngine.spAcilHastaKabul(payload);

          res.writeHead(201, { 'Content-Type': 'application/json; charset=UTF-8' });
          res.end(JSON.stringify({
            success: true,
            message: `Yeni acil seans Database Engine tarafından oluşturuldu ve TV Display yayınına alındı.`,
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
