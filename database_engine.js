/**
 * Kocaeli Üniversitesi Hastanesi Hemodiyaliz Ünitesi
 * Sadeleştirilmiş ve Optimize Edilmiş SQLite Veritabanı Motoru
 *
 * Sadece 2 Temiz Tablo:
 * 1. T_KULLANICILAR: Admin ve Sekreter hesapları
 * 2. T_HASTALAR: Hemodiyaliz seans hastaları
 * + VW_DYZ_GUNLUK_HASTA_SEANSLARI (SQL View)
 *
 * Gereksiz karmaşık ara tablolar temizlenmiştir.
 * 17 kayıtlı gerçek hasta ve tüm iş kuralları korunmaktadır.
 */

const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const SQLITE_DB_PATH = path.join(__dirname, 'diyaliz_veritabani.sqlite');
const DELETED_DB_PATH = path.join(__dirname, 'silinen_hastalar.sqlite');
const DELETED_JSON_PATH = path.join(__dirname, 'silinen_hastalar.json');
const DB_FILE_PATH = path.join(__dirname, 'diyaliz_database.json');
const SQL_FILE_PATH = path.join(__dirname, 'diyaliz_oracle_db.sql');

// Korunması gereken varsayılan 17 gerçek hasta (8 Pzt-Çar-Cum + 9 Sal-Per-Cmt)
const INITIAL_PATIENTS = [
  // PAZARTESİ - ÇARŞAMBA - CUMA GRUBU (8 HASTA)
  { refNo: 10001, hastaNo: '6736616', adi: 'RIZA HALUK', soyadi: 'TOYGARLI', gunGrubu: 'PZT_CAR_CUM', yatakNo: 1, vardiya: 'SABAH', gecmis: 142 },
  { refNo: 10002, hastaNo: '6532204', adi: 'AYNUR', soyadi: 'SAĞLAM', gunGrubu: 'PZT_CAR_CUM', yatakNo: 2, vardiya: 'SABAH', gecmis: 96 },
  { refNo: 10003, hastaNo: '6393894', adi: 'İSMAİL', soyadi: 'GÖKCE', gunGrubu: 'PZT_CAR_CUM', yatakNo: 3, vardiya: 'SABAH', gecmis: 88 },
  { refNo: 10004, hastaNo: '6040445', adi: 'ZEKİYE', soyadi: 'AKYOL', gunGrubu: 'PZT_CAR_CUM', yatakNo: 4, vardiya: 'SABAH', gecmis: 215 },
  { refNo: 10005, hastaNo: '1197043', adi: 'ŞAZİMET', soyadi: 'TOKGÖZ', gunGrubu: 'PZT_CAR_CUM', yatakNo: 5, vardiya: 'SABAH', gecmis: 64 },
  { refNo: 10006, hastaNo: '508095', adi: 'SEVİLAY', soyadi: 'ORDUKAYA', gunGrubu: 'PZT_CAR_CUM', yatakNo: 6, vardiya: 'SABAH', gecmis: 120 },
  { refNo: 10007, hastaNo: '312299', adi: 'CENGİZ', soyadi: 'PEKCAN', gunGrubu: 'PZT_CAR_CUM', yatakNo: 7, vardiya: 'SABAH', gecmis: 95 },
  { refNo: 10008, hastaNo: '29684', adi: 'SEBAHATTİN', soyadi: 'ÖZTÜRK', gunGrubu: 'PZT_CAR_CUM', yatakNo: 8, vardiya: 'SABAH', gecmis: 180 },

  // SALI - PERŞEMBE - CUMARTESİ GRUBU (9 HASTA)
  { refNo: 10009, hastaNo: '6149044', adi: 'FATİH', soyadi: 'IŞIK', gunGrubu: 'SAL_PER_CMT', yatakNo: 1, vardiya: 'SABAH', gecmis: 110 },
  { refNo: 10010, hastaNo: '1188734', adi: 'DURSUN', soyadi: 'ÖNAL', gunGrubu: 'SAL_PER_CMT', yatakNo: 2, vardiya: 'SABAH', gecmis: 134 },
  { refNo: 10011, hastaNo: '1179170', adi: 'HAVA', soyadi: 'HIDIR', gunGrubu: 'SAL_PER_CMT', yatakNo: 3, vardiya: 'SABAH', gecmis: 82 },
  { refNo: 10012, hastaNo: '606245', adi: 'MEHMET HENİFİ', soyadi: 'ÖZTEKİN', gunGrubu: 'SAL_PER_CMT', yatakNo: 4, vardiya: 'SABAH', gecmis: 156 },
  { refNo: 10013, hastaNo: '533598', adi: 'EKREM', soyadi: 'YILDIZ', gunGrubu: 'SAL_PER_CMT', yatakNo: 5, vardiya: 'SABAH', gecmis: 92 },
  { refNo: 10014, hastaNo: '266944', adi: 'MUSTAFA', soyadi: 'KIYAK', gunGrubu: 'SAL_PER_CMT', yatakNo: 6, vardiya: 'SABAH', gecmis: 148 },
  { refNo: 10015, hastaNo: '178990', adi: 'BAHİNAR', soyadi: 'GÖKMEN', gunGrubu: 'SAL_PER_CMT', yatakNo: 7, vardiya: 'SABAH', gecmis: 105 },
  { refNo: 10016, hastaNo: '141594', adi: 'SEVİM', soyadi: 'ZEYLAN', gunGrubu: 'SAL_PER_CMT', yatakNo: 8, vardiya: 'SABAH', gecmis: 164 },
  { refNo: 10017, hastaNo: '117389', adi: 'ZEKİ', soyadi: 'YILDIZ', gunGrubu: 'SAL_PER_CMT', yatakNo: 9, vardiya: 'SABAH', gecmis: 190 }
];

function splitFullName(fullNameStr) {
  const parts = String(fullNameStr || 'İsimsiz Hasta').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { adi: 'İsimsiz', soyadi: 'Hasta' };
  if (parts.length === 1) return { adi: parts[0], soyadi: '' };
  const soyadi = parts.pop();
  const adi = parts.join(' ');
  return { adi, soyadi };
}

class DialysisDatabaseEngine {
  constructor() {
    this.sqliteDb = null;
    this.deletedDb = null;
  }

  ensureDeletedDbInitialized() {
    if (this.deletedDb) return;

    this.deletedDb = new DatabaseSync(DELETED_DB_PATH);
    this.deletedDb.exec('PRAGMA journal_mode = WAL;');
    this.deletedDb.exec('PRAGMA synchronous = NORMAL;');

    this.deletedDb.exec(`
      CREATE TABLE IF NOT EXISTS T_SILINEN_HASTALAR (
        SILINME_ID INTEGER PRIMARY KEY AUTOINCREMENT,
        SILINME_TARIHI TEXT NOT NULL,
        SILINME_NEDENI TEXT DEFAULT 'Sekreter Paneli Hasta Silme',
        HASTASEANSREFNO INTEGER,
        HASTANO TEXT,
        HASTAADI TEXT,
        ADI TEXT,
        SOYADI TEXT,
        TCKIMLIKNO TEXT,
        HEMODIYALIZ_GECMISI INTEGER,
        VARDIYA TEXT,
        YATAKNO INTEGER,
        GUN_GRUBU TEXT,
        OZEL_GUNLER TEXT,
        SURE INTEGER,
        STATU TEXT,
        BASVURUTURU TEXT,
        MERKEZ TEXT,
        KAYIT_TARIHI TEXT,
        ACIL_TARIH TEXT,
        DETAY_JSON TEXT
      );
    `);
  }

  exportDeletedPatientsJson() {
    try {
      this.ensureDeletedDbInitialized();
      const records = this.deletedDb.prepare('SELECT * FROM T_SILINEN_HASTALAR ORDER BY SILINME_ID DESC').all();
      const formatted = records.map(r => ({
        ...r,
        OZEL_GUNLER: r.OZEL_GUNLER ? JSON.parse(r.OZEL_GUNLER) : null,
        DETAY_JSON: r.DETAY_JSON ? JSON.parse(r.DETAY_JSON) : null
      }));
      fs.writeFileSync(DELETED_JSON_PATH, JSON.stringify(formatted, null, 2), 'utf8');
    } catch (e) {
      console.warn('Silinen hastalar JSON dosyasına aktarılamadı:', e.message);
    }
  }

  ensureSqliteInitialized() {
    if (this.sqliteDb) return;

    this.sqliteDb = new DatabaseSync(SQLITE_DB_PATH);
    this.sqliteDb.exec('PRAGMA journal_mode = WAL;');
    this.sqliteDb.exec('PRAGMA synchronous = NORMAL;');

    // Eski gereksiz karmaşık ara tabloları temizle (Varsa kaldırılır)
    try {
      this.sqliteDb.exec(`
        DROP TABLE IF EXISTS T_DYZ_HASTA_TEDAVI_BILGILERI;
        DROP TABLE IF EXISTS T_DYZ_HASTA_BILGILERI;
        DROP TABLE IF EXISTS T_HASTA_BILGILERI;
        DROP TABLE IF EXISTS T_DYZ_HASTA_SEANSLARI;
      `);
    } catch (e) {
      // Tablolar yoksa sessizce devam et
    }

    // 1. KULLANICILAR TABLOSU (Admin, Sekreter ve Hemşire)
    this.sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS T_KULLANICILAR (
        KULLANICI_ID INTEGER PRIMARY KEY AUTOINCREMENT,
        KULLANICI_ADI TEXT UNIQUE NOT NULL,
        SIFRE TEXT NOT NULL,
        AD_SOYAD TEXT NOT NULL,
        ROL TEXT NOT NULL CHECK(ROL IN ('ADMIN', 'SEKRETER', 'HEMSIRE')),
        KAYIT_TARIHI TEXT NOT NULL
      );
    `);

    // 2. HASTALAR VE SEANSLAR ANA TABLOSU (Gereksiz sütunlardan arındırılmış temiz tablo)
    this.sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS T_HASTALAR (
        HASTASEANSREFNO INTEGER PRIMARY KEY,
        HASTANO TEXT NOT NULL,
        HASTAADI TEXT NOT NULL,
        ADI TEXT,
        SOYADI TEXT,
        YATAKNO INTEGER DEFAULT 1,
        VARDIYA TEXT DEFAULT 'SABAH',
        GUN_GRUBU TEXT DEFAULT 'PZT_CAR_CUM',
        OZEL_GUNLER TEXT,
        STATU TEXT DEFAULT 'BEKLEMEDE',
        SURE INTEGER DEFAULT 180,
        HEMODIYALIZ_GECMISI INTEGER DEFAULT 50,
        BASVURUTURU TEXT DEFAULT 'PLANLANDI',
        SEANSTARIHI TEXT,
        KAYIT_TARIHI TEXT,
        ACIL_TARIH TEXT,
        MANUEL_BUGUN_TARIH TEXT,
        MANUEL_HARIC_TARIH TEXT,
        kabuliptalaciklama TEXT DEFAULT ''
      );

      CREATE VIEW IF NOT EXISTS VW_DYZ_GUNLUK_HASTA_SEANSLARI AS
      SELECT 
        HASTASEANSREFNO,
        HASTANO,
        HASTAADI,
        ADI,
        SOYADI,
        YATAKNO,
        VARDIYA,
        GUN_GRUBU,
        OZEL_GUNLER,
        STATU,
        SURE,
        HEMODIYALIZ_GECMISI,
        BASVURUTURU,
        SEANSTARIHI,
        KAYIT_TARIHI,
        ACIL_TARIH,
        MANUEL_BUGUN_TARIH,
        MANUEL_HARIC_TARIH,
        kabuliptalaciklama
      FROM T_HASTALAR;
    `);

    // Varsayılan kullanıcıları kontrol et ve ekle (1 Admin, 1 Sekreter)
    this.seedDefaultUsers();

    // Hastaları kontrol et (Boş ise 17 varsayılan hastayı ekle)
    const countRow = this.sqliteDb.prepare('SELECT COUNT(*) AS cnt FROM T_HASTALAR').get();
    if (!countRow || Number(countRow.cnt) === 0) {
      this.seedDefaultPatientsToSqlite();
    }
  }

  seedDefaultUsers() {
    const nowIso = new Date().toISOString();
    const countUsers = this.sqliteDb.prepare('SELECT COUNT(*) AS cnt FROM T_KULLANICILAR').get();
    if (!countUsers || Number(countUsers.cnt) === 0) {
      const insUser = this.sqliteDb.prepare(`
        INSERT INTO T_KULLANICILAR (KULLANICI_ADI, SIFRE, AD_SOYAD, ROL, KAYIT_TARIHI)
        VALUES (?, ?, ?, ?, ?)
      `);
      // 1 Admin
      insUser.run('admin', '1234', 'Sistem Yöneticisi', 'ADMIN', nowIso);
      // 1 Sekreter
      insUser.run('sekreter', '1234', 'Özgül Bedge', 'SEKRETER', nowIso);
      // 1 Hemşire (Cumartesi ve nöbet günleri için)
      insUser.run('hemsire', '1234', 'Nöbetçi Hemşire', 'HEMSIRE', nowIso);
    }
  }

  seedDefaultPatientsToSqlite() {
    this.ensureSqliteInitialized();
    const nowIso = new Date().toISOString();

    this.sqliteDb.exec('BEGIN TRANSACTION;');
    try {
      this.sqliteDb.exec('DELETE FROM T_HASTALAR;');

      const insHasta = this.sqliteDb.prepare(`
        INSERT OR REPLACE INTO T_HASTALAR (
          HASTASEANSREFNO, HASTANO, HASTAADI, ADI, SOYADI, YATAKNO, VARDIYA,
          GUN_GRUBU, OZEL_GUNLER, STATU, SURE, HEMODIYALIZ_GECMISI, BASVURUTURU,
          SEANSTARIHI, KAYIT_TARIHI, ACIL_TARIH, MANUEL_BUGUN_TARIH, MANUEL_HARIC_TARIH,
          kabuliptalaciklama
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      INITIAL_PATIENTS.forEach((p) => {
        const fullName = `${p.adi} ${p.soyadi}`.trim();
        insHasta.run(
          p.refNo,
          p.hastaNo,
          fullName,
          p.adi,
          p.soyadi,
          p.yatakNo,
          p.vardiya || 'SABAH',
          p.gunGrubu,
          null,
          'BEKLEMEDE',
          180,
          p.gecmis || 50,
          'PLANLANDI',
          nowIso,
          nowIso,
          null,
          null,
          null,
          ''
        );
      });

      this.sqliteDb.exec('COMMIT;');
    } catch (err) {
      this.sqliteDb.exec('ROLLBACK;');
      throw err;
    }

    this.exportSnapshotsFromSqlite();
  }

  exportSnapshotsFromSqlite() {
    try {
      this.ensureSqliteInitialized();
      const T_KULLANICILAR = this.sqliteDb.prepare('SELECT KULLANICI_ID, KULLANICI_ADI, AD_SOYAD, ROL, KAYIT_TARIHI FROM T_KULLANICILAR').all();
      const rawHastalar = this.sqliteDb.prepare('SELECT * FROM T_HASTALAR ORDER BY HASTASEANSREFNO ASC').all();

      const T_HASTALAR = rawHastalar.map(s => ({
        ...s,
        OZEL_GUNLER: s.OZEL_GUNLER ? JSON.parse(s.OZEL_GUNLER) : null
      }));

      const payload = {
        VERITABANI_TURU: 'SQLite3 (diyaliz_veritabani.sqlite) - Sadeleştirilmiş Mimari',
        SON_GUNCELLEME: new Date().toISOString(),
        TOPLAM_HASTA_SAYISI: T_HASTALAR.length,
        TOPLAM_KULLANICI_SAYISI: T_KULLANICILAR.length,
        T_KULLANICILAR,
        T_HASTALAR
      };

      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(payload, null, 2), 'utf8');

      // SQL Dosyasını da senkronize güncelle
      const sqlLines = [
        '-- ============================================================================',
        '-- KOCAELİ ÜNİVERSİTESİ HEMODİYALİZ ÜNİTESİ - SADELEŞTİRİLMİŞ VERİTABANI ŞEMASI',
        `-- GÜNCELLEME: ${new Date().toISOString()}`,
        '-- ============================================================================',
        '',
        '-- 1. KULLANICILAR TABLOSU (Admin ve Sekreterler)',
        'CREATE TABLE T_KULLANICILAR (',
        '    KULLANICI_ID   NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,',
        '    KULLANICI_ADI  VARCHAR2(50) NOT NULL UNIQUE,',
        '    SIFRE          VARCHAR2(100) NOT NULL,',
        '    AD_SOYAD       VARCHAR2(100) NOT NULL,',
        '    ROL            VARCHAR2(20) NOT NULL CHECK (ROL IN (\'ADMIN\', \'SEKRETER\')),',
        '    KAYIT_TARIHI   TIMESTAMP DEFAULT SYSTIMESTAMP',
        ');',
        '',
        '-- 2. HASTALAR VE SEANSLAR TABLOSU',
        'CREATE TABLE T_HASTALAR (',
        '    HASTASEANSREFNO     NUMBER PRIMARY KEY,',
        '    HASTANO             VARCHAR2(20) NOT NULL,',
        '    HASTAADI            VARCHAR2(100) NOT NULL,',
        '    ADI                 VARCHAR2(50),',
        '    SOYADI              VARCHAR2(50),',
        '    YATAKNO             NUMBER(2) DEFAULT 1,',
        '    VARDIYA             VARCHAR2(20) DEFAULT \'SABAH\',',
        '    GUN_GRUBU           VARCHAR2(20) DEFAULT \'PZT_CAR_CUM\',',
        '    OZEL_GUNLER         CLOB,',
        '    STATU               VARCHAR2(30) DEFAULT \'BEKLEMEDE\',',
        '    SURE                NUMBER(4) DEFAULT 180,',
        '    HEMODIYALIZ_GECMISI NUMBER(4) DEFAULT 50,',
        '    BASVURUTURU         VARCHAR2(30) DEFAULT \'PLANLANDI\',',
        '    SEANSTARIHI         TIMESTAMP,',
        '    KAYIT_TARIHI        TIMESTAMP,',
        '    ACIL_TARIH          TIMESTAMP,',
        '    MANUEL_BUGUN_TARIH  VARCHAR2(20),',
        '    MANUEL_HARIC_TARIH  VARCHAR2(20),',
        '    kabuliptalaciklama  VARCHAR2(500)',
        ');',
        '',
        '-- 3. GÜNCEL KULLANICI KAYITLARI'
      ];

      const allUsers = this.sqliteDb.prepare('SELECT * FROM T_KULLANICILAR').all();
      allUsers.forEach(u => {
        sqlLines.push(`INSERT INTO T_KULLANICILAR (KULLANICI_ADI, SIFRE, AD_SOYAD, ROL) VALUES ('${u.KULLANICI_ADI}', '****', '${u.AD_SOYAD}', '${u.ROL}');`);
      });

      sqlLines.push('', '-- 4. GÜNCEL HASTA SEANS LİSTESİ');
      T_HASTALAR.forEach(h => {
        const adiEscaped = (h.ADI || '').replace(/'/g, "''");
        const soyadiEscaped = (h.SOYADI || '').replace(/'/g, "''");
        const hastaAdiEscaped = (h.HASTAADI || '').replace(/'/g, "''");
        sqlLines.push(
          `INSERT INTO T_HASTALAR (HASTASEANSREFNO, HASTANO, HASTAADI, ADI, SOYADI, YATAKNO, VARDIYA, GUN_GRUBU, STATU, SURE, HEMODIYALIZ_GECMISI, BASVURUTURU) ` +
          `VALUES (${h.HASTASEANSREFNO}, '${h.HASTANO}', '${hastaAdiEscaped}', '${adiEscaped}', '${soyadiEscaped}', ${h.YATAKNO || 1}, '${h.VARDIYA || 'SABAH'}', '${h.GUN_GRUBU || 'PZT_CAR_CUM'}', '${h.STATU || 'BEKLEMEDE'}', ${h.SURE || 180}, ${h.HEMODIYALIZ_GECMISI || 50}, '${h.BASVURUTURU || 'PLANLANDI'}');`
        );
      });

      fs.writeFileSync(SQL_FILE_PATH, sqlLines.join('\n'), 'utf8');
    } catch (e) {
      console.warn('Veritabanı yansıması dışa aktarılamadı:', e.message);
    }
  }

  async init() {
    this.ensureSqliteInitialized();
    this.ensureDeletedDbInitialized();
    this.exportSnapshotsFromSqlite();
    this.exportDeletedPatientsJson();
    console.log(`⚡ [DATABASE ENGINE] Sadeleştirilmiş SQLite Veritabanı hazır: ${SQLITE_DB_PATH}`);
  }

  // ==========================================================================
  // KULLANICI YÖNETİMİ METODLARI (Admin & Sekreter)
  // ==========================================================================
  async loginUser(username, password) {
    this.ensureSqliteInitialized();
    if (!username || !password) return null;

    const user = this.sqliteDb.prepare(`
      SELECT KULLANICI_ID, KULLANICI_ADI, AD_SOYAD, ROL, KAYIT_TARIHI
      FROM T_KULLANICILAR
      WHERE LOWER(KULLANICI_ADI) = LOWER(?) AND SIFRE = ?
    `).get(username.trim(), password.trim());

    return user || null;
  }

  async getAllUsers() {
    this.ensureSqliteInitialized();
    return this.sqliteDb.prepare(`
      SELECT KULLANICI_ID, KULLANICI_ADI, AD_SOYAD, ROL, KAYIT_TARIHI
      FROM T_KULLANICILAR
      ORDER BY KULLANICI_ID ASC
    `).all();
  }

  async addSecretary({ username, password, fullName }) {
    this.ensureSqliteInitialized();
    const cleanUsername = String(username || '').trim().toLowerCase();
    const cleanPassword = String(password || '').trim();
    const cleanFullName = String(fullName || '').trim();

    if (!cleanUsername || cleanUsername.length < 3) {
      throw new Error('Kullanıcı adı en az 3 karakter olmalıdır.');
    }
    if (!cleanPassword || cleanPassword.length < 3) {
      throw new Error('Şifre en az 3 karakter olmalıdır.');
    }
    if (!cleanFullName) {
      throw new Error('Ad Soyad alanı boş bırakılamaz.');
    }

    const existing = this.sqliteDb.prepare('SELECT KULLANICI_ID FROM T_KULLANICILAR WHERE LOWER(KULLANICI_ADI) = ?').get(cleanUsername);
    if (existing) {
      throw new Error(`"${cleanUsername}" kullanıcı adı zaten kullanılmaktadır!`);
    }

    const nowIso = new Date().toISOString();
    const result = this.sqliteDb.prepare(`
      INSERT INTO T_KULLANICILAR (KULLANICI_ADI, SIFRE, AD_SOYAD, ROL, KAYIT_TARIHI)
      VALUES (?, ?, ?, 'SEKRETER', ?)
    `).run(cleanUsername, cleanPassword, cleanFullName, nowIso);

    this.exportSnapshotsFromSqlite();
    return {
      KULLANICI_ID: result.lastInsertRowid,
      KULLANICI_ADI: cleanUsername,
      AD_SOYAD: cleanFullName,
      ROL: 'SEKRETER',
      KAYIT_TARIHI: nowIso
    };
  }

  async deleteSecretary(userId) {
    this.ensureSqliteInitialized();
    const target = this.sqliteDb.prepare('SELECT * FROM T_KULLANICILAR WHERE KULLANICI_ID = ?').get(Number(userId));
    if (!target) {
      throw new Error('Silinmek istenen kullanıcı bulunamadı.');
    }
    if (target.ROL === 'ADMIN') {
      throw new Error('Yönetici (Admin) hesabı güvenlik gereği silinemez!');
    }

    this.sqliteDb.prepare('DELETE FROM T_KULLANICILAR WHERE KULLANICI_ID = ?').run(Number(userId));
    this.exportSnapshotsFromSqlite();
    return true;
  }

  async updatePassword(userId, newPassword) {
    this.ensureSqliteInitialized();
    const cleanPass = String(newPassword || '').trim();
    if (!cleanPass || cleanPass.length < 3) {
      throw new Error('Yeni şifre en az 3 karakter olmalıdır.');
    }

    const target = this.sqliteDb.prepare('SELECT * FROM T_KULLANICILAR WHERE KULLANICI_ID = ?').get(Number(userId));
    if (!target) {
      throw new Error('Kullanıcı bulunamadı.');
    }

    this.sqliteDb.prepare('UPDATE T_KULLANICILAR SET SIFRE = ? WHERE KULLANICI_ID = ?').run(cleanPass, Number(userId));
    this.exportSnapshotsFromSqlite();
    return true;
  }

  // ==========================================================================
  // HASTA VE SEANS İŞLEMLERİ (17 Hasta & Kurallar Tam Koruma Altındadır)
  // ==========================================================================
  async executeViewDyzGunlukHastaSeanslari(filterVardiya = null, filterGunGrubu = null) {
    this.ensureSqliteInitialized();
    const rawRows = this.sqliteDb.prepare('SELECT * FROM VW_DYZ_GUNLUK_HASTA_SEANSLARI').all();
    const rows = [];

    for (const r of rawRows) {
      const vardiyaStr = r.VARDIYA || 'SABAH';
      const gunGrubu = r.GUN_GRUBU || 'PZT_CAR_CUM';

      if (filterVardiya && vardiyaStr.toUpperCase() !== filterVardiya.toUpperCase()) continue;
      if (filterGunGrubu && filterGunGrubu !== 'TUMU' && gunGrubu !== filterGunGrubu && gunGrubu !== 'HER_GUN') continue;

      let parsedOzelGunler = null;
      if (r.OZEL_GUNLER) {
        try {
          parsedOzelGunler = JSON.parse(r.OZEL_GUNLER);
        } catch (_) {
          parsedOzelGunler = null;
        }
      }

      rows.push({
        HASTAADI: r.HASTAADI || `${r.ADI || ''} ${r.SOYADI || ''}`.trim() || 'İsimsiz Hasta',
        HASTANO: String(r.HASTANO || '00000'),
        HASTASEANSREFNO: Number(r.HASTASEANSREFNO),
        HASTATEDAVIREFNO: Number(r.HASTASEANSREFNO) + 40000,
        KABULTARIHI: r.KAYIT_TARIHI || r.SEANSTARIHI,
        HASTABASVURUREFNO: Number(r.HASTASEANSREFNO) + 20000,
        HASTAHIZMETREFNO: Number(r.HASTASEANSREFNO) + 30000,
        SEANSTARIHI: r.SEANSTARIHI,
        VARDIYA: vardiyaStr,
        SEANSTURU: 'HEMODIYALIZ',
        SURE: Number(r.SURE) || 180,
        BASVURUTURU: r.BASVURUTURU || 'PLANLANDI',
        MERKEZ: 'Erişkin',
        GUN_GRUBU: gunGrubu,
        OZEL_GUNLER: Array.isArray(parsedOzelGunler) ? parsedOzelGunler : null,
        KAYIT_TARIHI: r.KAYIT_TARIHI || null,
        ACIL_TARIH: r.ACIL_TARIH || null,
        MANUEL_BUGUN_TARIH: r.MANUEL_BUGUN_TARIH || null,
        MANUEL_HARIC_TARIH: r.MANUEL_HARIC_TARIH || null,
        kabuliptalaciklama: r.kabuliptalaciklama || '',
        STATU: r.STATU || 'BEKLEMEDE',
        YATAKNO: r.YATAKNO ? Number(r.YATAKNO) : 1,
        HEMODIYALIZ_GECMISI: Number(r.HEMODIYALIZ_GECMISI ?? 50)
      });
    }

    return rows;
  }

  async spDurumDegistir(seansRefNo, yeniDurum, aciklama = null, bedNo = null, sure = null) {
    this.ensureSqliteInitialized();
    const existing = this.sqliteDb.prepare(
      'SELECT * FROM T_HASTALAR WHERE HASTASEANSREFNO = ?'
    ).get(Number(seansRefNo));
    if (!existing) return null;

    const updatedStatu = yeniDurum || existing.STATU;
    const updatedAciklama = (aciklama !== null && aciklama !== undefined) ? String(aciklama) : existing.kabuliptalaciklama;
    const updatedBed = (bedNo !== null && bedNo !== undefined) ? Number(bedNo) : existing.YATAKNO;
    const updatedSure = (sure !== null && sure !== undefined) ? Number(sure) : existing.SURE;

    this.sqliteDb.prepare(`
      UPDATE T_HASTALAR
      SET STATU = ?, kabuliptalaciklama = ?, YATAKNO = ?, SURE = ?
      WHERE HASTASEANSREFNO = ?
    `).run(updatedStatu, updatedAciklama, updatedBed, updatedSure, Number(seansRefNo));

    this.exportSnapshotsFromSqlite();
    return this.sqliteDb.prepare('SELECT * FROM T_HASTALAR WHERE HASTASEANSREFNO = ?').get(Number(seansRefNo));
  }

  async spHastaGuncelle(payload) {
    this.ensureSqliteInitialized();
    const seansRefNo = Number(payload.HASTASEANSREFNO || payload.seansId);
    const seans = this.sqliteDb.prepare(
      'SELECT * FROM T_HASTALAR WHERE HASTASEANSREFNO = ?'
    ).get(seansRefNo);
    if (!seans) return null;

    const oldHastaNo = String(seans.HASTANO);
    const newHastaNo = payload.HASTANO ? String(payload.HASTANO).trim() : oldHastaNo;
    if (newHastaNo && !/^\d{5,8}$/.test(newHastaNo)) {
      throw new Error('Hasta numarası sadece rakamlardan oluşmalı, en az 5 ve en fazla 8 karakter olmalıdır.');
    }

    const fullClean = payload.HASTAADI ? String(payload.HASTAADI).trim() : seans.HASTAADI;
    const { adi, soyadi } = splitFullName(fullClean);

    const updatedVardiya = payload.VARDIYA !== undefined ? payload.VARDIYA : seans.VARDIYA;
    const updatedYatak = payload.YATAKNO !== undefined ? (Number(payload.YATAKNO) || 1) : seans.YATAKNO;
    const updatedGunGrubu = payload.GUN_GRUBU !== undefined ? payload.GUN_GRUBU : seans.GUN_GRUBU;
    const updatedOzelGunler = payload.OZEL_GUNLER !== undefined
      ? (Array.isArray(payload.OZEL_GUNLER) ? JSON.stringify(payload.OZEL_GUNLER) : null)
      : seans.OZEL_GUNLER;
    const updatedSure = payload.SURE !== undefined ? (Number(payload.SURE) || 180) : seans.SURE;
    const updatedStatu = payload.STATU !== undefined ? payload.STATU : seans.STATU;

    this.sqliteDb.prepare(`
      UPDATE T_HASTALAR
      SET HASTAADI = ?, ADI = ?, SOYADI = ?, HASTANO = ?, VARDIYA = ?,
          YATAKNO = ?, GUN_GRUBU = ?, OZEL_GUNLER = ?, SURE = ?, STATU = ?
      WHERE HASTASEANSREFNO = ?
    `).run(
      fullClean,
      adi,
      soyadi,
      newHastaNo,
      updatedVardiya,
      updatedYatak,
      updatedGunGrubu,
      updatedOzelGunler,
      updatedSure,
      updatedStatu,
      seansRefNo
    );

    this.exportSnapshotsFromSqlite();
    return this.sqliteDb.prepare('SELECT * FROM T_HASTALAR WHERE HASTASEANSREFNO = ?').get(seansRefNo);
  }

  async spTamListeSenkronizeEt(rosterList) {
    this.ensureSqliteInitialized();
    if (!Array.isArray(rosterList)) return [];

    const nowIso = new Date().toISOString();
    this.sqliteDb.exec('BEGIN TRANSACTION;');
    try {
      this.sqliteDb.exec('DELETE FROM T_HASTALAR;');

      const insHasta = this.sqliteDb.prepare(`
        INSERT OR REPLACE INTO T_HASTALAR (
          HASTASEANSREFNO, HASTANO, HASTAADI, ADI, SOYADI, YATAKNO, VARDIYA,
          GUN_GRUBU, OZEL_GUNLER, STATU, SURE, HEMODIYALIZ_GECMISI, BASVURUTURU,
          SEANSTARIHI, KAYIT_TARIHI, ACIL_TARIH, MANUEL_BUGUN_TARIH, MANUEL_HARIC_TARIH,
          kabuliptalaciklama
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      rosterList.forEach((r, idx) => {
        const hastaNo = String(r.HASTANO || '').trim();
        const fullClean = String(r.HASTAADI || 'İsimsiz Hasta').trim();
        const { adi, soyadi } = splitFullName(fullClean);
        const vardiyaStr = r.VARDIYA || 'SABAH';

        insHasta.run(
          Number(r.HASTASEANSREFNO) || (10001 + idx),
          hastaNo,
          fullClean,
          adi,
          soyadi,
          Number(r.YATAKNO) || 1,
          vardiyaStr,
          r.GUN_GRUBU || 'PZT_CAR_CUM',
          Array.isArray(r.OZEL_GUNLER) ? JSON.stringify(r.OZEL_GUNLER) : (typeof r.OZEL_GUNLER === 'string' ? r.OZEL_GUNLER : null),
          r.STATU || 'BEKLEMEDE',
          Number(r.SURE) || 180,
          Number(r.HEMODIYALIZ_GECMISI ?? 50),
          r.BASVURUTURU || 'PLANLANDI',
          r.SEANSTARIHI ? String(r.SEANSTARIHI) : nowIso,
          r.KAYIT_TARIHI ? String(r.KAYIT_TARIHI) : nowIso,
          r.ACIL_TARIH || null,
          r.MANUEL_BUGUN_TARIH || null,
          r.MANUEL_HARIC_TARIH || null,
          r.kabuliptalaciklama || ''
        );
      });

      this.sqliteDb.exec('COMMIT;');
    } catch (err) {
      this.sqliteDb.exec('ROLLBACK;');
      throw err;
    }

    this.exportSnapshotsFromSqlite();
    return this.sqliteDb.prepare('SELECT * FROM T_HASTALAR').all();
  }

  async spAcilHastaKabul(hastaData) {
    this.ensureSqliteInitialized();
    const hastaNo = String(hastaData.HASTANO || '').trim();
    if (!hastaNo) {
      throw new Error('Hasta numarası (HASTANO) zorunludur ve otomatik atanamaz.');
    }
    if (!/^\d{5,8}$/.test(hastaNo)) {
      throw new Error('Hasta numarası sadece rakamlardan oluşmalı, en az 5 ve en fazla 8 karakter olmalıdır.');
    }

    const newSeansRefNo = Number(hastaData.HASTASEANSREFNO || Date.now());
    const nowIso = new Date().toISOString();
    const { adi, soyadi } = splitFullName(hastaData.HASTAADI || 'YENİ HASTA');
    const fullClean = `${adi} ${soyadi}`.trim();
    const vardiyaStr = hastaData.VARDIYA || 'SABAH';

    this.sqliteDb.prepare(`
      INSERT OR REPLACE INTO T_HASTALAR (
        HASTASEANSREFNO, HASTANO, HASTAADI, ADI, SOYADI, YATAKNO, VARDIYA,
        GUN_GRUBU, OZEL_GUNLER, STATU, SURE, HEMODIYALIZ_GECMISI, BASVURUTURU,
        SEANSTARIHI, KAYIT_TARIHI, ACIL_TARIH, MANUEL_BUGUN_TARIH, MANUEL_HARIC_TARIH,
        kabuliptalaciklama
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      newSeansRefNo,
      hastaNo,
      fullClean,
      adi,
      soyadi,
      Number(hastaData.YATAKNO) || 1,
      vardiyaStr,
      hastaData.GUN_GRUBU || 'PZT_CAR_CUM',
      Array.isArray(hastaData.OZEL_GUNLER) ? JSON.stringify(hastaData.OZEL_GUNLER) : null,
      hastaData.STATU || 'BEKLEMEDE',
      Number(hastaData.SURE) || 180,
      Number(hastaData.HEMODIYALIZ_GECMISI ?? 50),
      hastaData.BASVURUTURU || 'PLANLANDI',
      nowIso,
      hastaData.KAYIT_TARIHI || nowIso,
      hastaData.ACIL_TARIH || null,
      null,
      null,
      ''
    );

    this.exportSnapshotsFromSqlite();
    return this.sqliteDb.prepare('SELECT * FROM T_HASTALAR WHERE HASTASEANSREFNO = ?').get(newSeansRefNo);
  }

  async spHastaSil(seansRefNo, hastaNo = null, silinmeNedeni = 'Sekreter Paneli Hasta Silme') {
    this.ensureSqliteInitialized();
    this.ensureDeletedDbInitialized();

    const targetSeans = seansRefNo
      ? this.sqliteDb.prepare('SELECT * FROM T_HASTALAR WHERE HASTASEANSREFNO = ?').get(Number(seansRefNo))
      : (hastaNo ? this.sqliteDb.prepare('SELECT * FROM T_HASTALAR WHERE HASTANO = ?').get(String(hastaNo)) : null);

    const resolvedHastaNo = hastaNo || (targetSeans ? targetSeans.HASTANO : null);

    // 1. AYRI SİLİNENLER VERİTABANINA (silinen_hastalar.sqlite) ARŞİVLE
    if (targetSeans) {
      try {
        const nowIso = new Date().toISOString();
        this.deletedDb.prepare(`
          INSERT INTO T_SILINEN_HASTALAR (
            SILINME_TARIHI, SILINME_NEDENI, HASTASEANSREFNO, HASTANO, HASTAADI,
            ADI, SOYADI, TCKIMLIKNO, HEMODIYALIZ_GECMISI, VARDIYA, YATAKNO,
            GUN_GRUBU, OZEL_GUNLER, SURE, STATU, BASVURUTURU, MERKEZ,
            KAYIT_TARIHI, ACIL_TARIH, DETAY_JSON
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          nowIso,
          silinmeNedeni,
          Number(targetSeans.HASTASEANSREFNO),
          String(targetSeans.HASTANO),
          targetSeans.HASTAADI,
          targetSeans.ADI,
          targetSeans.SOYADI,
          targetSeans.HASTANO,
          Number(targetSeans.HEMODIYALIZ_GECMISI || 50),
          targetSeans.VARDIYA,
          Number(targetSeans.YATAKNO || 1),
          targetSeans.GUN_GRUBU,
          targetSeans.OZEL_GUNLER,
          Number(targetSeans.SURE || 180),
          targetSeans.STATU,
          targetSeans.BASVURUTURU,
          'Erişkin',
          targetSeans.KAYIT_TARIHI,
          targetSeans.ACIL_TARIH,
          JSON.stringify(targetSeans)
        );

        this.exportDeletedPatientsJson();
      } catch (e) {
        console.warn('Silinen hasta arşiv veritabanına eklenirken hata oluştu:', e.message);
      }
    }

    // 2. AKTİF VERİTABANINDAN (diyaliz_veritabani.sqlite) KALDIR
    if (seansRefNo) {
      this.sqliteDb.prepare('DELETE FROM T_HASTALAR WHERE HASTASEANSREFNO = ?').run(Number(seansRefNo));
    } else if (resolvedHastaNo) {
      this.sqliteDb.prepare('DELETE FROM T_HASTALAR WHERE HASTANO = ?').run(String(resolvedHastaNo));
    }

    this.exportSnapshotsFromSqlite();
    return true;
  }

  async getDeletedPatients() {
    this.ensureDeletedDbInitialized();
    const rows = this.deletedDb.prepare('SELECT * FROM T_SILINEN_HASTALAR ORDER BY SILINME_ID DESC').all();
    return rows.map(r => ({
      ...r,
      OZEL_GUNLER: r.OZEL_GUNLER ? JSON.parse(r.OZEL_GUNLER) : null,
      DETAY_JSON: r.DETAY_JSON ? JSON.parse(r.DETAY_JSON) : null
    }));
  }

  async spResetToDefaults() {
    this.seedDefaultPatientsToSqlite();
    return this.sqliteDb.prepare('SELECT * FROM T_HASTALAR').all();
  }
}

module.exports = new DialysisDatabaseEngine();
