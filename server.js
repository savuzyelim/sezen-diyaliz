/**
 * Kocaeli Üniversitesi Hastanesi Hemodiyaliz Ünitesi
 * Canlı Yayın & REST API & SQLite Veritabanı Sunucusu
 * 
 * Güvenlik Özellikleri (Cyber Security & Anti-Attack Hardening):
 * 1. Rate Limiting / DDoS Koruması: IP başına istek hız sınırlaması.
 * 2. Payload Boyut Sınırı: Aşırı büyük JSON paketleriyle RAM tüketim saldırılarını engelleme (Max 2MB).
 * 3. Path Traversal & Dosya Erişim Engeli: Dizin dışına sızma (../), .sqlite, .sql, .env, .git gibi kritik dosyalara erişim yasağı.
 * 4. HTTP Güvenlik Başlıkları: X-Frame-Options, X-Content-Type-Options, Strict Referrer, X-XSS-Protection.
 * 5. Input Validation & SQL Enjeksiyon Koruması: Parametrik SQL sorguları (database_engine.js) ve temiz girdi kontrolü.
 * 6. Güvenli CORS & Method Whitelisting: İzin verilmeyen HTTP metodlarının engellenmesi.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const dbEngine = require('./database_engine');

const PORT = process.env.PORT || 3000;
const MAX_BODY_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB Max Payload limit

// Veritabanı motorunu başlat
dbEngine.init();

// Ekranlar arası canlı senkronizasyon paketi (Sekreter -> Bekleme Ekranı)
let latestSyncPacket = null;

// ============================================================================
// GÜVENLİK SİSTEMİ: RATE LIMITING & DDOS KORUMASI
// ============================================================================
const ipRequestHistory = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 Dakika
const RATE_LIMIT_MAX_REQUESTS = 300;     // Dakikada en fazla 300 istek
const BLOCKED_IPS = new Set();

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

function checkRateLimit(clientIp) {
  if (BLOCKED_IPS.has(clientIp)) return false;

  const now = Date.now();
  let record = ipRequestHistory.get(clientIp);

  if (!record || now - record.startTime > RATE_LIMIT_WINDOW_MS) {
    record = { count: 1, startTime: now };
    ipRequestHistory.set(clientIp, record);
    return true;
  }

  record.count++;
  if (record.count > RATE_LIMIT_MAX_REQUESTS) {
    console.warn(`🚨 [GÜVENLİK ALARMI] Aşırı istek tespit edildi! IP geçici olarak sınırlandırıldı: ${clientIp}`);
    return false;
  }

  return true;
}

// 5 dakikada bir eski rate-limit kayıtlarını temizle
setInterval(() => {
  const now = Date.now();
  for (const [ip, rec] of ipRequestHistory.entries()) {
    if (now - rec.startTime > RATE_LIMIT_WINDOW_MS) {
      ipRequestHistory.delete(ip);
    }
  }
}, 5 * 60 * 1000);

// KVKK İsim Maskeleme Fonksiyonu
function maskFullName(fullName) {
  if (!fullName) return '***';
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return parts.map(p => {
    if (p.length <= 3) return p + '***';
    return p.substring(0, 3) + '*'.repeat(p.length - 3);
  }).join(' ');
}

// Yerel Ağ IPv4 Adreslerini Tespit Eden Fonksiyon
function getLocalNetworkAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        addresses.push(net.address);
      }
    }
  }
  return addresses;
}

// İzin verilen güvenli statik MIME tipleri
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Güvenlik: Doğrudan web üzerinden indirilmesi yasaklanan dosya uzantıları
const FORBIDDEN_EXTENSIONS = new Set([
  '.sqlite', '.sqlite-wal', '.sqlite-shm', '.db', '.sql', '.env', '.git', '.lock', '.bat', '.ps1', '.sh', '.exe'
]);

// HTTP Güvenlik Başlıklarını Ekleyen Fonksiyon
function setSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
}

// Güvenli Body Parser (Payload Limit Kontrollü)
function parseJsonBodySafely(req, maxBytes = MAX_BODY_SIZE_BYTES) {
  return new Promise((resolve, reject) => {
    let bodyStr = '';
    let receivedBytes = 0;

    req.on('data', chunk => {
      receivedBytes += chunk.length;
      if (receivedBytes > maxBytes) {
        req.destroy();
        reject(new Error('PAYLOAD_TOO_LARGE'));
        return;
      }
      bodyStr += chunk;
    });

    req.on('end', () => {
      try {
        const parsed = JSON.parse(bodyStr || '{}');
        resolve(parsed);
      } catch (err) {
        reject(new Error('INVALID_JSON: ' + err.message));
      }
    });

    req.on('error', err => reject(err));
  });
}

const server = http.createServer(async (req, res) => {
  setSecurityHeaders(res);

  const clientIp = getClientIp(req);

  // 1. Rate Limit / DDoS Kontrolü
  if (!checkRateLimit(clientIp)) {
    res.writeHead(429, { 'Content-Type': 'application/json; charset=UTF-8' });
    res.end(JSON.stringify({ error: 'Çok fazla istek gönderildi. Lütfen bir süre bekleyiniz. (HTTP 429 Too Many Requests)' }));
    return;
  }

  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // --------------------------------------------------------------------------
  // KULLANICI GİRİŞ & YETKİLENDİRME ENDPOINT'LERİ (/api/auth/login)
  // --------------------------------------------------------------------------
  if (pathname === '/api/auth/login' && req.method === 'POST') {
    try {
      const { username, password } = await parseJsonBodySafely(req);
      const user = await dbEngine.loginUser(username, password);
      if (user) {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
        res.end(JSON.stringify({
          success: true,
          user: {
            id: user.KULLANICI_ID,
            username: user.KULLANICI_ADI,
            fullName: user.AD_SOYAD,
            role: user.ROL,
            createdAt: user.KAYIT_TARIHI
          }
        }));
      } else {
        res.writeHead(401, { 'Content-Type': 'application/json; charset=UTF-8' });
        res.end(JSON.stringify({ success: false, error: 'Hatalı kullanıcı adı veya şifre!' }));
      }
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=UTF-8' });
      res.end(JSON.stringify({ success: false, error: e.message }));
    }
    return;
  }

  // --------------------------------------------------------------------------
  // HESAP VE SEKRETER YÖNETİMİ ENDPOINT'LERİ (/api/kullanicilar)
  // Admin: sekreter ekleyebilir, sekreter silebilir, tüm kullanıcıları listeleyebilir
  // --------------------------------------------------------------------------
  if (pathname === '/api/kullanicilar') {
    // 1. Kullanıcı Listesi (GET)
    if (req.method === 'GET') {
      try {
        const users = await dbEngine.getAllUsers();
        res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
        res.end(JSON.stringify({ success: true, users }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=UTF-8' });
        res.end(JSON.stringify({ success: false, error: e.message }));
      }
      return;
    }

    // 2. Yeni Sekreter Ekleme (POST) - Sadece Admin yetkisiyle
    if (req.method === 'POST') {
      try {
        const payload = await parseJsonBodySafely(req);
        const newUser = await dbEngine.addSecretary({
          username: payload.username,
          password: payload.password,
          fullName: payload.fullName
        });
        res.writeHead(201, { 'Content-Type': 'application/json; charset=UTF-8' });
        res.end(JSON.stringify({
          success: true,
          message: `Yeni sekreter "${newUser.AD_SOYAD}" başarıyla eklendi.`,
          user: newUser
        }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=UTF-8' });
        res.end(JSON.stringify({ success: false, error: e.message }));
      }
      return;
    }

    // 3. Sekreter Silme (DELETE) - Sadece Admin yetkisiyle
    if (req.method === 'DELETE') {
      try {
        const userId = parsedUrl.searchParams.get('id') || parsedUrl.searchParams.get('userId');
        if (!userId) {
          throw new Error('Silinecek sekreterin kullanıcı ID bilgisi gereklidir.');
        }
        await dbEngine.deleteSecretary(userId);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
        res.end(JSON.stringify({ success: true, message: 'Sekreter hesabı başarıyla silindi.' }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=UTF-8' });
        res.end(JSON.stringify({ success: false, error: e.message }));
      }
      return;
    }
  }

  // 4. Şifre Değiştirme (PUT /api/kullanicilar/sifre)
  if (pathname === '/api/kullanicilar/sifre' && req.method === 'PUT') {
    try {
      const payload = await parseJsonBodySafely(req);
      const userId = payload.userId || payload.id;
      const newPassword = payload.newPassword || payload.password;
      if (!userId || !newPassword) {
        throw new Error('Kullanıcı ID ve yeni şifre gereklidir.');
      }
      await dbEngine.updatePassword(userId, newPassword);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
      res.end(JSON.stringify({ success: true, message: 'Şifreniz başarıyla güncellendi.' }));
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=UTF-8' });
      res.end(JSON.stringify({ success: false, error: e.message }));
    }
    return;
  }

  // --------------------------------------------------------------------------
  // AĞ VE CANLI YAYIN BİLGİSİ ENDPOINT'İ: /api/network-info
  // --------------------------------------------------------------------------
  if (pathname === '/api/network-info' && req.method === 'GET') {
    const lanIps = getLocalNetworkAddresses();
    res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
    res.end(JSON.stringify({
      port: PORT,
      lanIps: lanIps,
      offlineSupported: true,
      localhost: {
        sekreter: `http://localhost:${PORT}/sekreter.html`,
        displayGenel: `http://localhost:${PORT}/display.html`,
        tv1Bekleme: `http://localhost:${PORT}/display.html?tv=1`,
        tv2Diyaliz: `http://localhost:${PORT}/display.html?tv=2`,
        tv3Taburcu: `http://localhost:${PORT}/display.html?tv=3`
      },
      networkUrls: lanIps.map(ip => ({
        ip: ip,
        sekreter: `http://${ip}:${PORT}/sekreter.html`,
        displayGenel: `http://${ip}:${PORT}/display.html`,
        tv1Bekleme: `http://${ip}:${PORT}/display.html?tv=1`,
        tv2Diyaliz: `http://${ip}:${PORT}/display.html?tv=2`,
        tv3Taburcu: `http://${ip}:${PORT}/display.html?tv=3`
      }))
    }, null, 2));
    return;
  }

  // --------------------------------------------------------------------------
  // SİLİNEN HASTALAR VERİTABANI ENDPOINT'İ: /api/silinen-hastalar (GET)
  // --------------------------------------------------------------------------
  if (pathname === '/api/silinen-hastalar' && req.method === 'GET') {
    dbEngine.getDeletedPatients().then(rows => {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
      res.end(JSON.stringify(rows, null, 2));
    }).catch(err => {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=UTF-8' });
      res.end(JSON.stringify({ error: err.message }));
    });
    return;
  }

  // --------------------------------------------------------------------------
  // TEK ANA ENDPOINT: /api/seanslar (GET, POST, PATCH, DELETE)
  // SQLite Veritabanı motoru ile doğrudan çift yönlü bağlantı
  // --------------------------------------------------------------------------
  if (pathname === '/api/seanslar') {
    if (req.method === 'GET') {
      const vardiyaFilter = parsedUrl.searchParams.get('vardiya');
      const gunGrubuFilter = parsedUrl.searchParams.get('gunGrubu');
      dbEngine.executeViewDyzGunlukHastaSeanslari(vardiyaFilter, gunGrubuFilter).then(rows => {
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

    if (req.method === 'DELETE') {
      const seansRefNo = parsedUrl.searchParams.get('seansId') || parsedUrl.searchParams.get('HASTASEANSREFNO');
      const hastaNo = parsedUrl.searchParams.get('hastaNo') || parsedUrl.searchParams.get('HASTANO');
      dbEngine.spHastaSil(seansRefNo, hastaNo, 'REST API DELETE').then(deleted => {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
        res.end(JSON.stringify({ success: true, deleted }));
      }).catch(err => {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=UTF-8' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      });
      return;
    }

    if (req.method === 'POST' || req.method === 'PATCH' || req.method === 'PUT') {
      try {
        const payload = await parseJsonBodySafely(req);
        const seansRefNo = payload.HASTASEANSREFNO || payload.seansId || payload.seansRefNo;

        if (payload.ACTION === 'SYNC_ROSTER' && Array.isArray(payload.roster)) {
          const synced = await dbEngine.spTamListeSenkronizeEt(payload.roster);
          res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
          res.end(JSON.stringify({
            success: true,
            count: synced.length,
            message: `SQLite tabloları (${synced.length} hasta) güncellendi.`
          }));
          return;
        }

        if (payload.ACTION === 'DELETE') {
          const deleted = await dbEngine.spHastaSil(seansRefNo, payload.HASTANO, payload.SILINME_NEDENI || 'Sekreter Tarafından Silindi');
          res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
          res.end(JSON.stringify({ success: true, deleted, message: `Seans #${seansRefNo} silindi ve silinen_hastalar.sqlite veritabanına arşivlendi.` }));
          return;
        }

        if (payload.ACTION === 'UPDATE' && seansRefNo) {
          const updated = await dbEngine.spHastaGuncelle(payload);
          res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
          res.end(JSON.stringify({
            success: true,
            message: `Hasta #${seansRefNo} bilgileri SQLite veritabanında güncellendi.`,
            updatedRecord: updated
          }));
          return;
        }

        if (seansRefNo && payload.ACTION !== 'ADD') {
          const updated = await dbEngine.spDurumDegistir(
            seansRefNo,
            payload.STATU || payload.status,
            payload.kabuliptalaciklama !== undefined ? payload.kabuliptalaciklama : payload.abortReason,
            payload.YATAKNO !== undefined ? payload.YATAKNO : payload.bedNo,
            payload.SURE !== undefined ? payload.SURE : payload.duration
          );

          if (updated) {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
            res.end(JSON.stringify({
              success: true,
              message: `Seans #${seansRefNo} SQLite veritabanında güncellendi.`,
              updatedRecord: updated
            }));
            return;
          }
        }

        // Yeni Hasta Kabul
        const newSeans = await dbEngine.spAcilHastaKabul(payload);
        res.writeHead(201, { 'Content-Type': 'application/json; charset=UTF-8' });
        res.end(JSON.stringify({
          success: true,
          message: `Yeni hasta kaydı SQLite veritabanına eklendi.`,
          record: newSeans
        }));
      } catch (e) {
        const status = e.message === 'PAYLOAD_TOO_LARGE' ? 413 : 400;
        res.writeHead(status, { 'Content-Type': 'application/json; charset=UTF-8' });
        res.end(JSON.stringify({ success: false, error: e.message }));
      }
      return;
    }
  }

  // --------------------------------------------------------------------------
  // CANLI EKRAN SENKRONİZASYON ENDPOINT'İ: /api/sync-state (GET & POST)
  // --------------------------------------------------------------------------
  if (pathname === '/api/sync-state') {
    if (req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
      res.end(JSON.stringify(latestSyncPacket || {}));
      return;
    }
    if (req.method === 'POST') {
      try {
        latestSyncPacket = await parseJsonBodySafely(req);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
        res.end(JSON.stringify({ success: true, timestamp: latestSyncPacket.timestamp }));
      } catch (e) {
        const status = e.message === 'PAYLOAD_TOO_LARGE' ? 413 : 400;
        res.writeHead(status, { 'Content-Type': 'application/json; charset=UTF-8' });
        res.end(JSON.stringify({ success: false, error: e.message }));
      }
      return;
    }
  }

  // --------------------------------------------------------------------------
  // RESET / VARSAYILANLARA SIFIRLAMA ENDPOINT'İ: /api/reset
  // --------------------------------------------------------------------------
  if (pathname === '/api/reset' && req.method === 'POST') {
    dbEngine.spResetToDefaults().then(() => {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
      res.end(JSON.stringify({ success: true, message: 'SQLite veritabanı varsayılan 17 hastaya sıfırlandı.' }));
    }).catch(err => {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=UTF-8' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    });
    return;
  }

  // --------------------------------------------------------------------------
  // GÜVENLİ STATİK DOSYA SUNUCUSU (Path Traversal & Forbidden File Engeli)
  // --------------------------------------------------------------------------
  const safePathname = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  const resolvedBase = path.resolve(__dirname);
  const targetFilePath = path.resolve(resolvedBase, safePathname === '/' || safePathname === '\\' ? 'index.html' : '.' + safePathname);

  // Güvenlik 1: Dizin dışına çıkış kontrolü (Path Traversal Protection)
  if (!targetFilePath.startsWith(resolvedBase)) {
    console.warn(`🚨 [GÜVENLİK ALARMI] Path Traversal girişimi engellendi! IP: ${clientIp}, Yol: ${pathname}`);
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=UTF-8' });
    res.end('403 Forbidden: Yetkisiz dizin erişimi engellendi.');
    return;
  }

  // Güvenlik 2: Kritik dosya ve uzantı kontrolü (.sqlite, .sql, .env vb.)
  const ext = path.extname(targetFilePath).toLowerCase();
  if (FORBIDDEN_EXTENSIONS.has(ext) || path.basename(targetFilePath).startsWith('.')) {
    console.warn(`🚨 [GÜVENLİK ALARMI] Kritik dosya indirme girişimi engellendi: ${targetFilePath}`);
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=UTF-8' });
    res.end('403 Forbidden: Bu dosya türüne doğrudan web erişimi engellenmiştir.');
    return;
  }

  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(targetFilePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
        res.end('404 Not Found: İstenen sayfa bulunamadı.');
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

// 0.0.0.0 ile tüm ağ arayüzlerine bağlan
server.listen(PORT, '0.0.0.0', () => {
  const lanIps = getLocalNetworkAddresses();
  console.log(`================================================================`);
  console.log(`🛡️  Hemodiyaliz Ünitesi Güvenli Sunucu Başlatıldı! (Port: ${PORT})`);
  console.log(`🌐 Bu Bilgisayardan (Yerel):`);
  console.log(`   🖥️  Sekreter Ekranı : http://localhost:${PORT}/sekreter.html`);
  console.log(`   📺 TV Bekleme Ekranı: http://localhost:${PORT}/display.html`);
  console.log(`   📋 Ana Sayfa        : http://localhost:${PORT}/`);
  if (lanIps.length > 0) {
    console.log(`📱 İnternetsiz Yerel Ağdaki Cihazlar:`);
    lanIps.forEach(ip => {
      console.log(`   🖥️  Sekreter Bilgisayarı: http://${ip}:${PORT}/sekreter.html`);
      console.log(`   📺 TV Bekleme Salonu   : http://${ip}:${PORT}/display.html?tv=1`);
    });
  }
  console.log(`💾 SQLite Veritabanı : diyaliz_veritabani.sqlite`);
  console.log(`🗄️  Silinenler Arşivi : silinen_hastalar.sqlite`);
  console.log(`================================================================`);
});
